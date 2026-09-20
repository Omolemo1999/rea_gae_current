import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, hashToken } from "@/lib/security";
import { strongPassword } from "@/lib/validation";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  const err = strongPassword(String(password || ""));
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash: hashToken(String(token || "")) } });
  if (!record || record.usedAt || record.expiresAt <= new Date()) return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash: hashPassword(String(password)) } }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);
  return NextResponse.json({ message: "Password reset successfully." });
}
