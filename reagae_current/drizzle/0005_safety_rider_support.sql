ALTER TYPE "RiderVerificationStatus" ADD VALUE IF NOT EXISTS 'PENDING_REVIEW';

CREATE TYPE "SafetyMediaType" AS ENUM ('AUDIO','IMAGE','VIDEO');
ALTER TABLE "RiderProfile" ADD COLUMN IF NOT EXISTS "faceVerificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE "RiderProfile" ADD COLUMN IF NOT EXISTS "identityVerificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE "RiderProfile" ADD COLUMN IF NOT EXISTS "faceLivenessResult" TEXT;
ALTER TABLE "RiderProfile" ADD COLUMN IF NOT EXISTS "faceMatchResult" TEXT;
CREATE TABLE IF NOT EXISTS "RiderVerificationDocument" (
  "id" TEXT PRIMARY KEY, "createdAt" TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL,
  "riderId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "type" "DocumentType" NOT NULL,
  "fileName" TEXT NOT NULL, "mimeType" TEXT NOT NULL, "data" TEXT NOT NULL, "status" "DriverDocumentStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedBy" TEXT, "reviewNotes" TEXT
);
CREATE INDEX IF NOT EXISTS "rider_verification_document_idx" ON "RiderVerificationDocument"("riderId","type");
CREATE TABLE IF NOT EXISTS "SafetyMedia" (
  "id" TEXT PRIMARY KEY, "createdAt" TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL,
  "rideId" TEXT NOT NULL REFERENCES "Ride"("id") ON DELETE CASCADE, "bookingId" TEXT NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
  "uploadedById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT, "type" "SafetyMediaType" NOT NULL,
  "fileName" TEXT NOT NULL, "mimeType" TEXT NOT NULL, "sizeBytes" INTEGER NOT NULL, "durationSeconds" INTEGER, "data" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS "safety_media_ride_booking_idx" ON "SafetyMedia"("rideId","bookingId");
CREATE TABLE IF NOT EXISTS "SupportRequest" (
  "id" TEXT PRIMARY KEY, "createdAt" TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL,
  "rideId" TEXT NOT NULL REFERENCES "Ride"("id") ON DELETE CASCADE, "bookingId" TEXT NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "assignedAgentId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "status" TEXT NOT NULL DEFAULT 'WAITING', "subject" TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS "support_request_queue_idx" ON "SupportRequest"("status","createdAt");
CREATE TABLE IF NOT EXISTS "SupportMessage" (
  "id" TEXT PRIMARY KEY, "createdAt" TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL,
  "requestId" TEXT NOT NULL REFERENCES "SupportRequest"("id") ON DELETE CASCADE, "senderId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "body" TEXT NOT NULL, "readAt" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "support_message_request_idx" ON "SupportMessage"("requestId","createdAt");
