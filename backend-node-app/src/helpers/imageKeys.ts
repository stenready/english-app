const THUMBNAIL_EXTENSION = /\.webp$/
const ORIGINAL_EXTENSION = '.original.webp'

// The database keeps the thumbnail key; the full-size copy lies next to it:
// user/avatars/<uuid>.webp → user/avatars/<uuid>.original.webp
export const getOriginalKey = (key: string): string => {
  return key.replace(THUMBNAIL_EXTENSION, ORIGINAL_EXTENSION)
}
