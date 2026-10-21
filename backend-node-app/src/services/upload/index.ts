import { randomUUID } from 'node:crypto'
import sharp, { type FitEnum } from 'sharp'
import { ERROR_CODES } from '#constants/errorCodes'
import { HTTP_STATUS } from '#constants/httpStatus'
import { UPLOAD_FOLDERS, type UploadFolder } from '#constants/uploads'
import { AppError } from '#errors/AppError'
import { getOriginalKey } from '#helpers/imageKeys'
import storage from '#storage/s3'
import { parseOrThrow } from '#validation/parseOrThrow'
import { imageUploadSchema } from '#validation/upload'

// Formats sharp reads here; anything else (GIF, SVG, HEIC, not an image) is rejected
const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp'])
const OUTPUT_CONTENT_TYPE = 'image/webp'
const OUTPUT_EXTENSION = 'webp'
const WEBP_QUALITY = 82
// The full-size copy for viewing: the longer side at most, never upscaled
const ORIGINAL_MAX_SIZE = 2048

interface ImagePreset {
  width: number
  height: number
  fit: keyof FitEnum
}

// The thumbnail of each folder: avatars are small squares
const IMAGE_PRESETS: Record<UploadFolder, ImagePreset> = {
  [UPLOAD_FOLDERS.USER_AVATARS]: { width: 256, height: 256, fit: 'cover' },
}

export interface UploadedFile {
  // Saved in the database (e.g. users.avatar_key)
  key: string
  // The thumbnail, for showing right away
  url: string
  // The full-size copy, for viewing
  originalUrl: string
}

interface ProcessedImage {
  thumbnail: Buffer
  original: Buffer
}

const createInvalidImageError = (): AppError => {
  return new AppError(
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    ERROR_CODES.INVALID_IMAGE,
    'The file is not a PNG, JPEG or WEBP image.',
  )
}

// Decoding is the real type check: the file name and Content-Type come from the client.
// Re-encoding also drops EXIF (GPS location from phone photos) and anything hidden in the file
const processImage = async (buffer: Buffer, preset: ImagePreset): Promise<ProcessedImage> => {
  try {
    const image = sharp(buffer)
    const { format } = await image.metadata()

    if (!format || !ACCEPTED_FORMATS.has(format)) {
      throw createInvalidImageError()
    }

    const [thumbnail, original] = await Promise.all([
      image
        .clone()
        .autoOrient()
        .resize(preset.width, preset.height, { fit: preset.fit })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer(),
      // The whole photo, not cropped
      image
        .clone()
        .autoOrient()
        .resize(ORIGINAL_MAX_SIZE, ORIGINAL_MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer(),
    ])

    return { thumbnail, original }
  } catch (error) {
    if (error instanceof AppError) throw error

    // sharp couldn't decode it: not an image or a broken one
    throw createInvalidImageError()
  }
}

const uploadImage = async (
  file: Express.Multer.File | undefined,
  fields: unknown,
): Promise<UploadedFile> => {
  const { folder } = parseOrThrow(imageUploadSchema, fields)

  if (!file) {
    throw new AppError(
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.FILE_REQUIRED,
      'No file in the "file" field.',
    )
  }

  const { thumbnail, original } = await processImage(file.buffer, IMAGE_PRESETS[folder])
  // Random name: the client's file name is never used (../, spaces, collisions)
  const key = `${folder}/${randomUUID()}.${OUTPUT_EXTENSION}`
  const originalKey = getOriginalKey(key)

  await Promise.all([
    storage.uploadObject({ key, body: thumbnail, contentType: OUTPUT_CONTENT_TYPE }),
    storage.uploadObject({ key: originalKey, body: original, contentType: OUTPUT_CONTENT_TYPE }),
  ])

  return {
    key,
    url: storage.getPublicUrl(key),
    originalUrl: storage.getPublicUrl(originalKey),
  }
}

export default { uploadImage }
