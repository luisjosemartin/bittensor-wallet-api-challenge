-- CreateEnum
CREATE TYPE "public"."AuditLogEventType" AS ENUM ('WALLET_CREATION', 'WALLET_READ', 'WALLET_TRANSFER', 'API_KEY_USAGE', 'RATE_LIMIT_EXCEEDED');

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" "public"."AuditLogEventType" NOT NULL,
    "apiKeyId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_eventType_idx" ON "public"."AuditLog"("eventType");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "public"."AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_apiKeyId_idx" ON "public"."AuditLog"("apiKeyId");
