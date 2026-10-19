import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '#config/env'

// Keys are random and never reused: browsers and CDNs may cache a file forever
const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable'

const client = new S3Client({
  endpoint: env.s3.endpoint,
  region: env.s3.region,
  forcePathStyle: env.s3.forcePathStyle,
  credentials: {
    accessKeyId: env.s3.accessKey,
    secretAccessKey: env.s3.secretKey,
  },
})

interface UploadObjectOptions {
  key: string
  body: Buffer
  contentType: string
}

const uploadObject = async ({ key, body, contentType }: UploadObjectOptions): Promise<void> => {
  await client.send(
    new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: IMMUTABLE_CACHE_CONTROL,
    }),
  )
}

const deleteObject = async (key: string): Promise<void> => {
  await client.send(new DeleteObjectCommand({ Bucket: env.s3.bucket, Key: key }))
}

// The bucket is public-read: a file link is the public base + key
const getPublicUrl = (key: string): string => {
  return `${env.s3.publicUrl}/${key}`
}

export default { deleteObject, getPublicUrl, uploadObject }
