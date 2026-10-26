export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_INPUT_BYTES = 10 * 1024 * 1024 // 10 MB before compression

// Shrinks a photo so its longest side is at most `maxSide` pixels and saves it as a JPEG.
export async function compressImage(file: File, maxSide = 1280, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser cannot process images')

  ctx.fillStyle = '#ffffff' // transparent PNG areas become white instead of black
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not compress the image'))),
      'image/jpeg',
      quality
    )
  })
}