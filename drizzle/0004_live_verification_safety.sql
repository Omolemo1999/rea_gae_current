ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profilePhotoUrl" text;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "faceLivenessResult" text;
ALTER TABLE "DriverProfile" ADD COLUMN IF NOT EXISTS "faceMatchResult" text;
ALTER TABLE "VerificationCase" ADD COLUMN IF NOT EXISTS "expiresAt" timestamptz;
ALTER TABLE "SafetyReport" ADD COLUMN IF NOT EXISTS "bookingId" text REFERENCES "Booking"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "safety_report_ride_booking_idx" ON "SafetyReport"("rideId", "bookingId");

CREATE TABLE IF NOT EXISTS "Tip" (
  "id" text PRIMARY KEY,
  "createdAt" timestamptz NOT NULL,
  "updatedAt" timestamptz NOT NULL,
  "bookingId" text NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
  "rideId" text NOT NULL REFERENCES "Ride"("id") ON DELETE CASCADE,
  "fromUserId" text NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "toUserId" text NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "amount" real NOT NULL,
  "paymentReference" text NOT NULL UNIQUE,
  "status" text NOT NULL DEFAULT 'PAID'
);
CREATE UNIQUE INDEX IF NOT EXISTS "tip_booking_from_unique" ON "Tip"("bookingId", "fromUserId");
CREATE INDEX IF NOT EXISTS "tip_ride_idx" ON "Tip"("rideId");

CREATE TABLE IF NOT EXISTS "ExperienceContent" (
  "id" text PRIMARY KEY,
  "createdAt" timestamptz NOT NULL,
  "updatedAt" timestamptz NOT NULL,
  "slot" text NOT NULL,
  "audience" text NOT NULL DEFAULT 'BOTH',
  "title" text NOT NULL,
  "body" text NOT NULL DEFAULT '',
  "imageUrl" text,
  "buttonLabel" text,
  "buttonHref" text,
  "active" boolean NOT NULL DEFAULT true,
  "sortOrder" integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "experience_slot_audience_idx" ON "ExperienceContent"("slot", "audience", "active");
