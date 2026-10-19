-- The column keeps an S3 key, not a URL: the public URL is built by the API
ALTER TABLE "users" RENAME COLUMN "avatar_url" TO "avatar_key";
