// Where files may be uploaded: the client names a folder, anything else is rejected.
// Never build an S3 key from client input as is: it could write anywhere in the bucket
export const UPLOAD_FOLDERS = Object.freeze({
  USER_AVATARS: 'user/avatars',
} as const)

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS]

const BYTES_IN_MEGABYTE = 1024 * 1024

// Same limit as the admin AppImageUpload
export const IMAGE_UPLOAD_MAX_SIZE = 5 * BYTES_IN_MEGABYTE

// Multipart field names of POST /uploads/images
export const UPLOAD_FILE_FIELD = 'file'
