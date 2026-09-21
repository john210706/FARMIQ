CREATE TABLE "MessageOutbox" (
 "id" TEXT NOT NULL, "notificationId" TEXT NOT NULL, "userId" TEXT NOT NULL, "body" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'PENDING', "attempts" INTEGER NOT NULL DEFAULT 0,
 "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "providerReference" TEXT, "error" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "MessageOutbox_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MessageOutbox_notificationId_key" ON "MessageOutbox"("notificationId");
CREATE UNIQUE INDEX "MessageOutbox_providerReference_key" ON "MessageOutbox"("providerReference");
CREATE INDEX "MessageOutbox_status_nextAttemptAt_idx" ON "MessageOutbox"("status", "nextAttemptAt");
CREATE TABLE "Payout" (
 "id" TEXT NOT NULL, "bookingId" TEXT NOT NULL, "ownerId" TEXT NOT NULL, "amount" DECIMAL(10,2) NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'REQUESTED', "provider" TEXT NOT NULL DEFAULT 'sandbox', "reference" TEXT, "note" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Payout_bookingId_key" ON "Payout"("bookingId");
CREATE INDEX "Payout_ownerId_status_idx" ON "Payout"("ownerId", "status");
