import type { RequestHandler } from 'express'
import multer from 'multer'
import { ERROR_CODES } from '#constants/errorCodes'
import { HTTP_STATUS } from '#constants/httpStatus'
import { IMAGE_UPLOAD_MAX_SIZE, UPLOAD_FILE_FIELD } from '#constants/uploads'
import { AppError } from '#errors/AppError'

// multipart/form-data: the file goes to request.file (kept in memory, it's small
// and goes to S3 right away), the text fields to request.body
const parseSingleFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_UPLOAD_MAX_SIZE, files: 1 },
}).single(UPLOAD_FILE_FIELD)

// multer reports a too large file as its own error type: turn it into the API format
export const singleFileUpload: RequestHandler = (request, response, next) => {
  parseSingleFile(request, response, (error: unknown) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      next(
        new AppError(
          HTTP_STATUS.PAYLOAD_TOO_LARGE,
          ERROR_CODES.FILE_TOO_LARGE,
          `The file is larger than ${IMAGE_UPLOAD_MAX_SIZE} bytes.`,
        ),
      )
      return
    }

    next(error)
  })
}
