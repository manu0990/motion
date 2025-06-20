-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "title" SET DEFAULT 'New chat';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRejected" BOOLEAN NOT NULL DEFAULT false;
