-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INVITED', 'OPENED', 'STARTED', 'CONFIRMED', 'PENDING_PAYMENT', 'PAID', 'CANCELLED', 'REJECTED');

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "invitationId" TEXT,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "formData" JSONB NOT NULL DEFAULT '{}',
    "status" "ParticipantStatus" NOT NULL DEFAULT 'CONFIRMED',
    "rejectedReason" TEXT,
    "privacyAcceptedAt" TIMESTAMP(3),
    "ticketCode" TEXT,
    "qrCheckedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_invitationId_key" ON "Participant"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_ticketCode_key" ON "Participant"("ticketCode");

-- CreateIndex
CREATE INDEX "Participant_eventId_status_idx" ON "Participant"("eventId", "status");

-- CreateIndex
CREATE INDEX "Participant_email_idx" ON "Participant"("email");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
