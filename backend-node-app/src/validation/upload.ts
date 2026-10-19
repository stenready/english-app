import { z } from 'zod'
import { UPLOAD_FOLDERS } from '#constants/uploads'

// Text fields of POST /uploads/images (the file itself is checked by multer and sharp)
export const imageUploadSchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS),
})
