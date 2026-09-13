import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";

export async function POST(req: Request) {
  const body = await req.json();
  const token = String(body.token || "");
  const selfie = String(body.selfie || "");
  if (!token || !selfie) return NextResponse.json({ error: "Live selfie capture is required." }, { status: 400 });
  if (!selfie.startsWith("data:image/")) return NextResponse.json({ error: "A live camera image is required." }, { status: 400 });
  if (selfie.length > 5_000_000) return NextResponse.json({ error: "Capture is too large. Please retake it." }, { status: 413 });
  const verification = await db.verificationCase.findFirst({ where: { type: { in: ["DRIVER_FACE", "RIDER_IDENTITY"] }, reference: hashToken(token), status: "IN_PROGRESS" } });
  if (!verification || !verification.expiresAt || verification.expiresAt <= new Date()) return NextResponse.json({ error: "This verification link has expired. Start a new face verification from the driver app." }, { status: 400 });

  const driverDoc = await db.driverDocument.findFirst({ where: { driverId: verification.userId, type: "ID" }, orderBy: { createdAt: "desc" } });
  const riderDoc = await db.riderVerificationDocument.findFirst({ where: { riderId: verification.userId, type: "ID" }, orderBy: { createdAt: "desc" } });
  const idDocument = driverDoc || riderDoc;
  if (!idDocument) return NextResponse.json({ error: "Your identity document must be uploaded before the live face check." }, { status: 400 });
  let liveness = "PENDING_REVIEW";
  let faceMatch = "PENDING_REVIEW";
  if (process.env.BIOMETRIC_PROVIDER_URL && process.env.BIOMETRIC_PROVIDER_TOKEN) {
    try {
      const response = await fetch(process.env.BIOMETRIC_PROVIDER_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.BIOMETRIC_PROVIDER_TOKEN}` }, body: JSON.stringify({ userId: verification.userId, idDocument: idDocument.data, selfie, checks: { liveness: true, faceMatchAgainstId: true } }) });
      if (response.ok) {
        const result = await response.json();
        liveness = result.livenessPassed ? "PASSED" : "FAILED";
        faceMatch = result.faceMatchPassed ? "PASSED" : "FAILED";
      }
    } catch { /* agent review remains the safe fallback */ }
  }

  const owner=await db.user.findUnique({where:{id:verification.userId}});
  if(owner?.role==="DRIVER") await db.driverProfile.update({ where: { userId: verification.userId }, data: { faceVerificationStatus: "PENDING_REVIEW", verificationStatus: "PENDING_REVIEW", faceLivenessResult: liveness, faceMatchResult: faceMatch } });
  if(owner?.role==="RIDER") await db.riderProfile.update({ where: { userId: verification.userId }, data: { faceVerificationStatus: "PENDING_REVIEW", verificationStatus: "PENDING_REVIEW", faceLivenessResult: liveness, faceMatchResult: faceMatch } });
  await db.verificationCase.update({ where: { id: verification.id }, data: { status: "PENDING_REVIEW", reference: null } });
  return NextResponse.json({ message: "Live capture received. Your face/liveness result is now with the verification team.", liveness, faceMatch });
}
