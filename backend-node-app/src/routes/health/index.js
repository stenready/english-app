import { Router } from 'express'
import { getHealth } from '#controllers/health'

export const healthRouter = Router()

healthRouter.get('/', getHealth)

// JOIN/LEFT/RIGHT. POSTGRESS
// NEST
// PRISMA/ TypeORM+
// Websockets
// Redis/auth
// OAuth/GoogleAuth/
// GRPS/Kafka
// DOCKER
// CI/DI
// K8T ознакомление
