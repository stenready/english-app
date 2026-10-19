// POST /uploads/images → { data: UploadedFile }
export interface UploadedFile {
  // Saved with the entity, e.g. user.avatarKey
  key: string
  // Public link for showing the image
  url: string
}
