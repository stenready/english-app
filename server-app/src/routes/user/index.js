import { Router } from 'express'
import userController from '#controllers/user'

export const userRouter = Router()

userRouter.get('/', userController.getUsers)
userRouter.post('/', userController.createUser)
userRouter.get('/:id', userController.getUser)
userRouter.patch('/:id', userController.updateUser)
userRouter.delete('/:id', userController.deleteUser)
