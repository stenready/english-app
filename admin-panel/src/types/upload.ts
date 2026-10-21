// POST /uploads/images → { data: UploadedFile }
export interface UploadedFile {
  // Saved with the entity, e.g. user.avatarKey
  key: string
  // Public link to the thumbnail
  url: string
  // Public link to the full-size copy: for viewing
  originalUrl: string
}
