import type { RequestHandler } from 'express'
import { HTTP_STATUS } from '#constants/httpStatus'
import userService from '#services/user'

interface UserParams {
  id: string
}

const getUsers: RequestHandler = (_request, response) => {
  response.status(HTTP_STATUS.OK).json({ data: userService.getUsers() })
}

const getUser: RequestHandler<UserParams> = (request, response) => {
  response.status(HTTP_STATUS.OK).json({ data: userService.getUser(request.params.id) })
}

const createUser: RequestHandler = (request, response) => {
  response.status(HTTP_STATUS.CREATED).json({ data: userService.createUser(request.body) })
}

const updateUser: RequestHandler<UserParams> = (request, response) => {
  const user = userService.updateUser(request.params.id, request.body)

  response.status(HTTP_STATUS.OK).json({ data: user })
}

const deleteUser: RequestHandler<UserParams> = (request, response) => {
  userService.deleteUser(request.params.id)

  response.status(HTTP_STATUS.NO_CONTENT).end()
}

export default { createUser, deleteUser, getUser, getUsers, updateUser }
