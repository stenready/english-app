import { HTTP_STATUS } from '#constants/httpStatus'
import userService from '#services/user'

const getUsers = (_request, response) => {
  response.status(HTTP_STATUS.OK).json({ data: userService.getUsers() })
}

const getUser = (request, response) => {
  response.status(HTTP_STATUS.OK).json({ data: userService.getUser(request.params.id) })
}

const createUser = (request, response) => {
  response.status(HTTP_STATUS.CREATED).json({ data: userService.createUser(request.body) })
}

const updateUser = (request, response) => {
  const user = userService.updateUser(request.params.id, request.body)

  response.status(HTTP_STATUS.OK).json({ data: user })
}

const deleteUser = (request, response) => {
  userService.deleteUser(request.params.id)

  response.status(HTTP_STATUS.NO_CONTENT).end()
}

export default { createUser, deleteUser, getUser, getUsers, updateUser }
