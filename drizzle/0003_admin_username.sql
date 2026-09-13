-- Staff username support and bootstrap-safe admin credential lookup
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" text;
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_unique_idx" ON "User" ("username") WHERE "username" IS NOT NULL;
