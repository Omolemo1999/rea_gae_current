import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";
import { setSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { token } = await req.json();
  const record = await db.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(String(token || "")) } });
  if (!record || record.expiresAt <= new Date()) return NextResponse.json({ error: "Invalid or expired verification link." }, { status: 400 });
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    db.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);
  const user = await db.user.findUnique({ where: { id: record.userId }, select: { role: true } });
  await setSession(record.userId);
  return NextResponse.json({ message: "Email verified successfully.", role: user?.role });
}
