import { Router } from 'express'
import { healthRouter } from './health/index.js'
import { userRouter } from './user/index.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/users', userRouter)
