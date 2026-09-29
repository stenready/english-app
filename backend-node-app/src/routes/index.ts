import { Router } from 'express'
import { healthRouter } from '#routes/health/index'
import { userRouter } from '#routes/user/index'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/users', userRouter)
