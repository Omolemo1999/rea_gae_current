import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, randomToken } from "@/lib/security";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, requestIp } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  const limit = rateLimit(`forgot:${requestIp(req)}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ message: "If the account exists, reset instructions have been issued." }, { status: 200 });
  const { email } = await req.json();
  const normalized = String(email || "").trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email: normalized } });
  if (user) {
    const token = randomToken();
    await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 15 * 60 * 1000) } });
    await sendPasswordResetEmail(user.email, user.firstName, token);
  }
  return NextResponse.json({ message: "If the account exists, reset instructions have been issued." });
}
