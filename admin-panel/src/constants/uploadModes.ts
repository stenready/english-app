// When AppImageUpload sends the chosen file to the server
const uploadModes = {
  // Right after the file is chosen
  INSTANT: 'instant',
  // Only when the form calls save() through a ref
  MANUAL: 'manual',
} as const

export type UploadMode = (typeof uploadModes)[keyof typeof uploadModes]

export default uploadModes
