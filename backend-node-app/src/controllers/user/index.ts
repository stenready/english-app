import type { RequestHandler } from 'express'
import { HTTP_STATUS } from '#constants/httpStatus'
import userService from '#services/user'

interface UserParams {
  id: string
}

// GET /users?first=10&skip=0&search=stas → { data: User[], meta: { totalCount, hasNext, hasPrev } }
const getUsers: RequestHandler = async (request, response) => {
  const { items, meta } = await userService.getUsers(request.query)

  response.status(HTTP_STATUS.OK).json({ data: items, meta })
}

const getUser: RequestHandler<UserParams> = async (request, response) => {
  response.status(HTTP_STATUS.OK).json({ data: await userService.getUser(request.params.id) })
}

const createUser: RequestHandler = async (request, response) => {
  response.status(HTTP_STATUS.CREATED).json({ data: await userService.createUser(request.body) })
}

const updateUser: RequestHandler<UserParams> = async (request, response) => {
  const user = await userService.updateUser(request.params.id, request.body)

  response.status(HTTP_STATUS.OK).json({ data: user })
}

const deleteUser: RequestHandler<UserParams> = async (request, response) => {
  await userService.deleteUser(request.params.id)

  response.status(HTTP_STATUS.NO_CONTENT).end()
}

export default { createUser, deleteUser, getUser, getUsers, updateUser }
