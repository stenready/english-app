// Same list as the backend (constants/uploads.ts): it rejects any other folder
const uploadFolders = {
  USER_AVATARS: 'user/avatars',
} as const

export type UploadFolder = (typeof uploadFolders)[keyof typeof uploadFolders]

export default uploadFolders
