-- AlterTable
ALTER TABLE "newsletter_subscribers" ADD COLUMN "unsubscribe_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_unsubscribe_token_key" ON "newsletter_subscribers"("unsubscribe_token");
