-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING');

-- AlterTable: existing users get the default
ALTER TABLE "users" ADD COLUMN     "status" "user_status" NOT NULL DEFAULT 'ACTIVE';
