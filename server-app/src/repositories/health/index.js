export const getRuntimeStatus = () => ({
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
})
