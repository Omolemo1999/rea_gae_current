import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashToken, randomToken } from "@/lib/security";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type } = await req.json();
  if (type === "email") {
    if (user.emailVerified) return NextResponse.json({ message: "Email is already verified." });
    const token = randomToken();
    await db.emailVerificationToken.deleteMany({ where: { userId: user.id } });
    await db.emailVerificationToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    await sendVerificationEmail(user.email, user.firstName, token);
    return NextResponse.json({ message: "A new verification email has been sent." });
  }
  if (type === "phone") {
    return NextResponse.json({ message: "Phone verification requires an SMS provider. The verification code endpoint is ready for integration; the account has not been marked verified." });
  }
  return NextResponse.json({ error: "Unsupported verification type." }, { status: 400 });
}
