import { Router } from 'express'
import uploadController from '#controllers/upload'
import { singleFileUpload } from '#middlewares/singleFileUpload'

export const uploadRouter = Router()

uploadRouter.post('/images', singleFileUpload, uploadController.uploadImage)
