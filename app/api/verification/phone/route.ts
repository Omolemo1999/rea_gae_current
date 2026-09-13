import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashToken, randomToken } from "@/lib/security";
import { rateLimit, requestIp } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  const limit = rateLimit(`phone-code:${requestIp(req)}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many verification requests. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await db.phoneVerificationCode.deleteMany({ where: { userId: user.id, usedAt: null } });
  await db.phoneVerificationCode.create({ data: { userId: user.id, codeHash: hashToken(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000) } });
  console.info(`[sms:development] Verification code for ${user.phone}: ${code}`);
  return NextResponse.json({ message: "A phone verification code was generated. Connect an SMS provider to deliver it to the user's phone." });
}
