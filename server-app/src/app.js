import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env, isProduction } from '#config/env'
import { errorHandler } from '#middlewares/errorHandler'
import { notFound } from '#middlewares/notFound'
import { apiRouter } from '#routes/index'

const API_PREFIX = '/api/v1'
const JSON_BODY_LIMIT = '1mb'
const LOG_FORMAT = isProduction ? 'combined' : 'dev'
const allowedOrigins = env.corsOrigin === '*' ? '*' : env.corsOrigin.split(',')

export const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: allowedOrigins }))
app.use(morgan(LOG_FORMAT))
app.use(express.json({ limit: JSON_BODY_LIMIT }))
app.use(API_PREFIX, apiRouter)
app.use(notFound)
app.use(errorHandler)
