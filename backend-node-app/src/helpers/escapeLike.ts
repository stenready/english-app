const LIKE_SPECIAL_CHARS = /[\\%_]/g

// For Prisma `contains` / `startsWith` / `endsWith` with user input: Prisma passes
// the value to LIKE as is, where "_" (any char) and "%" (anything) would match
// every row. A backslash makes them literal
export const escapeLike = (value: string): string => {
  return value.replace(LIKE_SPECIAL_CHARS, '\\$&')
}
