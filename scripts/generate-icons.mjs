/**
 * Genera todos los iconos del proyecto a partir del logo SVG.
 * Ejecutar: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC = resolve(ROOT, 'public')
const APP = resolve(ROOT, 'app')

const svgPath = resolve(PUBLIC, 'logo.svg')
const svgBuffer = readFileSync(svgPath)

/**
 * Genera un PNG a partir del SVG
 */
async function generatePng(size, outputPath, options = {}) {
  const { padding = 0, background = { r: 0, g: 0, b: 0, alpha: 0 } } = options

  let pipeline = sharp(svgBuffer).resize(size - padding * 2, size - padding * 2)

  if (padding > 0) {
    pipeline = pipeline.extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background,
    })
  }

  await pipeline.png().toFile(outputPath)
  console.log(`  ✓ ${outputPath.replace(ROOT + '/', '')} (${size}x${size})`)
}

/**
 * Genera favicon.ico (multi-size ICO) usando PNG buffers
 */
async function generateIco(outputPath) {
  // ICO con 16x16, 32x32, 48x48
  const sizes = [16, 32, 48]
  const images = await Promise.all(
    sizes.map((size) => sharp(svgBuffer).resize(size, size).png().toBuffer()),
  )

  // Build ICO file manually (simple BMP-in-ICO format)
  const ico = buildIco(images, sizes)
  writeFileSync(outputPath, ico)
  console.log(`  ✓ ${outputPath.replace(ROOT + '/', '')} (ICO: ${sizes.join(', ')})`)
}

/**
 * Build ICO binary from PNG buffers
 */
function buildIco(pngBuffers, sizes) {
  const numImages = pngBuffers.length
  const headerSize = 6
  const dirEntrySize = 16
  const dataOffset = headerSize + dirEntrySize * numImages

  // Calculate total size
  let totalDataSize = 0
  for (const buf of pngBuffers) {
    totalDataSize += buf.length
  }

  const icoBuffer = Buffer.alloc(dataOffset + totalDataSize)

  // ICO Header
  icoBuffer.writeUInt16LE(0, 0)          // Reserved
  icoBuffer.writeUInt16LE(1, 2)          // Type: ICO
  icoBuffer.writeUInt16LE(numImages, 4)  // Number of images

  // Directory entries + data
  let currentDataOffset = dataOffset
  for (let i = 0; i < numImages; i++) {
    const size = sizes[i]
    const pngBuf = pngBuffers[i]
    const entryOffset = headerSize + i * dirEntrySize

    icoBuffer.writeUInt8(size >= 256 ? 0 : size, entryOffset)      // Width
    icoBuffer.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1)  // Height
    icoBuffer.writeUInt8(0, entryOffset + 2)                        // Color palette
    icoBuffer.writeUInt8(0, entryOffset + 3)                        // Reserved
    icoBuffer.writeUInt16LE(1, entryOffset + 4)                     // Color planes
    icoBuffer.writeUInt16LE(32, entryOffset + 6)                    // Bits per pixel
    icoBuffer.writeUInt32LE(pngBuf.length, entryOffset + 8)         // Image size
    icoBuffer.writeUInt32LE(currentDataOffset, entryOffset + 12)    // Data offset

    pngBuf.copy(icoBuffer, currentDataOffset)
    currentDataOffset += pngBuf.length
  }

  return icoBuffer
}

/**
 * Genera el SVG para safari-pinned-tab (monocromo)
 */
function generateSafariPinnedTab(outputPath) {
  const monoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <path d="M256 48l32 80h84l-68 50 26 80-74-54-74 54 26-80-68-50h84l32-80z" fill="black"/>
</svg>`
  writeFileSync(outputPath, monoSvg)
  console.log(`  ✓ ${outputPath.replace(ROOT + '/', '')} (SVG pinned tab)`)
}

async function main() {
  console.log('\nGenerating icons...\n')

  await Promise.all([
    // Standard icons
    generatePng(16, resolve(PUBLIC, 'icon-16.png')),
    generatePng(32, resolve(PUBLIC, 'icon-32.png')),
    generatePng(192, resolve(PUBLIC, 'icon-192.png')),
    generatePng(512, resolve(PUBLIC, 'icon-512.png')),

    // Maskable icons (con padding 20% para safe zone)
    generatePng(192, resolve(PUBLIC, 'icon-192-maskable.png'), { padding: 19 }),
    generatePng(512, resolve(PUBLIC, 'icon-512-maskable.png'), { padding: 51 }),

    // Apple touch icon (180x180)
    generatePng(180, resolve(PUBLIC, 'apple-touch-icon.png')),

    // Favicon ICO
    generateIco(resolve(APP, 'favicon.ico')),
  ])

  // Safari pinned tab SVG
  generateSafariPinnedTab(resolve(PUBLIC, 'safari-pinned-tab.svg'))

  console.log('\n✓ All icons generated.\n')
}

main().catch(console.error)
