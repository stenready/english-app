import type { RequestHandler } from 'express'
import { HTTP_STATUS } from '#constants/httpStatus'
import uploadService from '#services/upload'

// POST /uploads/images (multipart: file + folder) → { data: { key, url } }
const uploadImage: RequestHandler = async (request, response) => {
  const data = await uploadService.uploadImage(request.file, request.body)

  response.status(HTTP_STATUS.CREATED).json({ data })
}

export default { uploadImage }
