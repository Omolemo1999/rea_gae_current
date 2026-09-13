import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { code } = await req.json();
  const record = await db.phoneVerificationCode.findFirst({ where: { userId: user.id, usedAt: null }, orderBy: { createdAt: "desc" } });
  if (!record || record.expiresAt <= new Date() || record.attempts >= 5) return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
  if (record.codeHash !== hashToken(String(code || ""))) {
    await db.phoneVerificationCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { phoneVerified: true } }),
    db.phoneVerificationCode.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.json({ message: "Phone verified successfully." });
}
