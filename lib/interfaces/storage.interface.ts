/**
 * Interface para servicios de almacenamiento.
 * Permite cambiar R2 por S3, GCS, Azure Blob, etc. sin tocar services.
 */
export interface IStorageService {
  /**
   * Sube un archivo al storage.
   * @returns URL del archivo subido
   */
  upload(
    key: string,
    file: Buffer | Blob | ReadableStream,
    contentType: string,
  ): Promise<string>

  /**
   * Descarga un archivo del storage.
   */
  download(key: string): Promise<Buffer>

  /**
   * Genera una URL firmada para acceso temporal (GET).
   * @param expiresIn Segundos hasta que expire (default: 3600)
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>

  /**
   * Genera una URL firmada para subir un archivo (PUT).
   * @returns URL firmada y URL publica del archivo
   */
  getUploadUrl(
    key: string,
    contentType: string,
    expiresIn?: number,
  ): Promise<{ url: string; publicUrl: string }>

  /**
   * Elimina un archivo del storage.
   */
  delete(key: string): Promise<void>

  /**
   * Verifica si un archivo existe.
   */
  exists(key: string): Promise<boolean>
}
