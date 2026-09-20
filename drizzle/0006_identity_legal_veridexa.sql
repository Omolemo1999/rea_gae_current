ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "legalAcceptedAt" TIMESTAMPTZ;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "legalVersion" TEXT;
ALTER TABLE "RiderProfile" ADD COLUMN IF NOT EXISTS "veridexaFaceTemplate" TEXT;

CREATE TABLE IF NOT EXISTS "RiderRideVerification" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  "riderId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "rideId" TEXT NOT NULL REFERENCES "Ride"("id") ON DELETE CASCADE,
  "status" "VerificationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "livenessResult" TEXT,
  "faceMatchResult" TEXT,
  "score" REAL,
  "tokenHash" TEXT UNIQUE,
  "capturedAt" TIMESTAMPTZ,
  "metadata" TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS "rider_ride_verification_lookup_idx" ON "RiderRideVerification"("riderId","rideId","createdAt");
