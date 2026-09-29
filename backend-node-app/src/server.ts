import { app } from '#app'
import { env } from '#config/env'

const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
const SHUTDOWN_TIMEOUT_MS = 5000
const listeningAddress = env.publicUrl ?? `port ${env.port}`

const server = app.listen(env.port, env.host, () => {
  console.info(`API is listening on ${listeningAddress} in ${env.nodeEnv} mode.`)
})

const shutdown = (signal: NodeJS.Signals): void => {
  console.info(`${signal} received. Closing server.`)

  server.close(() => {
    process.exit(0)
  })

  // Рвём keep-alive сокеты, иначе server.close ждёт их таймаута
  server.closeIdleConnections()

  const forceExit = setTimeout(() => {
    console.warn('Shutdown timed out. Forcing exit.')
    server.closeAllConnections()
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)

  forceExit.unref()
}

for (const signal of SHUTDOWN_SIGNALS) {
  process.once(signal, () => shutdown(signal))
}
