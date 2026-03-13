import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { IStorageService } from '@/lib/interfaces'

/**
 * Implementacion de IStorageService usando Cloudflare R2 (S3-compatible).
 * Para cambiar a AWS S3 o GCS, crear nuevo adapter.
 */
export class R2StorageService implements IStorageService {
  private client: S3Client
  private bucket: string
  private publicUrl: string

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
    this.bucket = process.env.R2_BUCKET_NAME!
    this.publicUrl = process.env.R2_PUBLIC_URL!
  }

  async upload(
    key: string,
    file: Buffer | Blob | ReadableStream,
    contentType: string,
  ): Promise<string> {
    let body: Buffer | Uint8Array

    if (Buffer.isBuffer(file)) {
      body = file
    } else if (file instanceof Blob) {
      body = Buffer.from(await file.arrayBuffer())
    } else if (
      typeof file === 'object' &&
      file !== null &&
      'getReader' in file
    ) {
      // ReadableStream
      const stream = file as ReadableStream<Uint8Array>
      const chunks: Uint8Array[] = []
      const reader = stream.getReader()
      let done = false
      while (!done) {
        const result = await reader.read()
        done = result.done
        if (result.value) {
          chunks.push(result.value)
        }
      }
      body = Buffer.concat(chunks)
    } else {
      throw new Error('Unsupported file type')
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )

    return `${this.publicUrl}/${key}`
  }

  async download(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    )

    // response.Body can be a ReadableStream, Blob, or other types depending on environment
    const body = response.Body
    if (!body) {
      throw new Error('Empty response body')
    }

    // Handle Node.js Readable stream (from @aws-sdk)
    if ('transformToByteArray' in body) {
      const bytes = await (
        body as { transformToByteArray: () => Promise<Uint8Array> }
      ).transformToByteArray()
      return Buffer.from(bytes)
    }

    // Handle Web ReadableStream
    if ('getReader' in body) {
      const stream = body as ReadableStream<Uint8Array>
      const chunks: Uint8Array[] = []
      const reader = stream.getReader()
      let done = false
      while (!done) {
        const result = await reader.read()
        done = result.done
        if (result.value) {
          chunks.push(result.value)
        }
      }
      return Buffer.concat(chunks)
    }

    throw new Error('Unsupported response body type')
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    return getSignedUrl(this.client, command, { expiresIn })
  }

  async getUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<{ url: string; publicUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    })

    const url = await getSignedUrl(this.client, command, { expiresIn })
    const publicUrl = `${this.publicUrl}/${key}`

    return { url, publicUrl }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    )
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      )
      return true
    } catch {
      return false
    }
  }
}
