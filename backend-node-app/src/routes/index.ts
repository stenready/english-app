import { Router } from 'express'
import { healthRouter } from '#routes/health/index'
import { uploadRouter } from '#routes/upload/index'
import { userRouter } from '#routes/user/index'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/uploads', uploadRouter)
apiRouter.use('/users', userRouter)
