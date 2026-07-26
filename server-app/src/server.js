import { app } from '#app'
import { env } from '#config/env'

const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM']
const listeningAddress = env.publicUrl ?? `port ${env.port}`

const server = app.listen(env.port, env.host, () => {
  console.info(`API is listening on ${listeningAddress} in ${env.nodeEnv} mode.`)
})

const shutdown = (signal) => {
  console.info(`${signal} received. Closing server.`)

  server.close(() => {
    process.exit(0)
  })
}

for (const signal of SHUTDOWN_SIGNALS) {
  process.once(signal, () => shutdown(signal))
}
