import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/security";
import { rateLimit, requestIp } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = requestIp(req);
    const bodyLimit = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!bodyLimit.allowed) return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(bodyLimit.retryAfter) } });
    const { email, password } = await req.json();
    const identifier = String(email || "").trim().toLowerCase();
    const user = await db.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] }
    });
    if (!user || user.accountStatus !== "ACTIVE" || !verifyPassword(String(password || ""), user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    if (!user.emailVerified) {
      return NextResponse.json({ error: "Please verify your email before signing in.", code: "EMAIL_NOT_VERIFIED", email: user.email }, { status: 403 });
    }
    await setSession(user.id);
    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch {
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
