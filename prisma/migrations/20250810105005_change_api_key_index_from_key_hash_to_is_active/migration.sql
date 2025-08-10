-- DropIndex
DROP INDEX "public"."ApiKey_keyHash_idx";

-- CreateIndex
CREATE INDEX "ApiKey_isActive_idx" ON "public"."ApiKey"("isActive");
