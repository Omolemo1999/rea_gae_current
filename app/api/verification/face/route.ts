import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hashToken, randomToken } from "@/lib/security";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || !["DRIVER","RIDER"].includes(user.role)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const token = randomToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await db.verificationCase.deleteMany({ where: { userId: user.id, type: user.role === "DRIVER" ? "DRIVER_FACE" : "RIDER_IDENTITY", status: { in: ["IN_PROGRESS", "PENDING_REVIEW"] } } });
  await db.verificationCase.create({ data: { userId: user.id, type: user.role === "DRIVER" ? "DRIVER_FACE" : "RIDER_IDENTITY", status: "IN_PROGRESS", reference: hashToken(token), expiresAt } });
  await user.role === "DRIVER" ? db.driverProfile.update({ where: { userId: user.id }, data: { faceVerificationStatus: "IN_PROGRESS", verificationStatus: "IN_PROGRESS", faceLivenessResult: null, faceMatchResult: null } }) : db.riderProfile.update({ where: { userId: user.id }, data: { faceVerificationStatus: "IN_PROGRESS", verificationStatus: "IN_PROGRESS", faceLivenessResult: null, faceMatchResult: null } });
  const origin = process.env.APP_URL || new URL("http://localhost:3000").origin;
  return NextResponse.json({ status: "IN_PROGRESS", url: `${origin}/verify/face/${encodeURIComponent(token)}`, expiresAt, message: "Open the secure verification link on a phone with a working camera. The live capture will be sent to the verification service or agent review." });
}
