import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";
import { compareFace, enrollFace, veridexaConfigured } from "@/lib/veridexa";

function dataUrlToBuffer(value: string) {
  const match = value.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/);
  if (!match) throw new Error("A valid camera image is required.");
  return { mimeType: match[1] === "image/jpg" ? "image/jpeg" : match[1], bytes: Buffer.from(match[2], "base64") };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || "");
    const selfie = String(body.selfie || "");
    if (!token || !selfie) return NextResponse.json({ error: "Live face capture is required." }, { status: 400 });

    const { mimeType, bytes } = dataUrlToBuffer(selfie);
    if (bytes.length > 4_000_000) return NextResponse.json({ error: "Capture is too large. Please retake it." }, { status: 413 });
    if (!veridexaConfigured()) return NextResponse.json({ error: "Identity verification is temporarily unavailable. Please try again later." }, { status: 503 });

    const rideVerification = await db.riderRideVerification.findUnique({ where: { tokenHash: hashToken(token) } });
    if (rideVerification && rideVerification.status === "IN_PROGRESS") {
      const rider = await db.riderProfile.findUnique({ where: { userId: rideVerification.riderId } });
      if (!rider?.veridexaFaceTemplate) return NextResponse.json({ error: "Your first-time face verification is not complete." }, { status: 409 });

      const probe = await enrollFace(bytes, mimeType);
      if (!probe.configured) return NextResponse.json({ error: "Verification service is unavailable." }, { status: 503 });
      const comparison = await compareFace(rider.veridexaFaceTemplate, Buffer.from(probe.template.vector, "base64"));
      const passed = comparison.configured && comparison.result?.passed === true;
      await db.riderRideVerification.update({
        where: { id: rideVerification.id },
        data: {
          status: passed ? "VERIFIED" : "REJECTED",
          livenessResult: "NOT_ASSESSED",
          faceMatchResult: passed ? "PASSED" : "FAILED",
          score: Number(comparison.result?.score ?? 0),
          capturedAt: new Date(),
          tokenHash: null,
          metadata: JSON.stringify({ requestId: comparison.requestId, threshold: comparison.result?.threshold, purpose: "RIDE_REQUEST_IDENTITY" }),
        },
      });
      return NextResponse.json({
        message: passed ? "Identity confirmed for this ride request." : "We could not match the live face to your verified rider profile. Please try again.",
        rideVerification: { status: passed ? "VERIFIED" : "REJECTED", score: comparison.result?.score ?? null },
      });
    }

    const verification = await db.verificationCase.findFirst({
      where: {
        type: { in: ["DRIVER_FACE", "RIDER_IDENTITY"] },
        reference: hashToken(token),
        status: "IN_PROGRESS",
      },
    });
    if (!verification || !verification.expiresAt || verification.expiresAt <= new Date()) {
      return NextResponse.json({ error: "This verification link has expired. Start a new verification." }, { status: 400 });
    }

    const driverDoc = await db.driverDocument.findFirst({ where: { driverId: verification.userId, type: "ID" }, orderBy: { createdAt: "desc" } });
    const riderDoc = await db.riderVerificationDocument.findFirst({ where: { riderId: verification.userId, type: "ID" }, orderBy: { createdAt: "desc" } });
    if (!driverDoc && !riderDoc) return NextResponse.json({ error: "Upload your identity document before the live face check." }, { status: 400 });

    const enrollment = await enrollFace(bytes, mimeType);
    if (!enrollment.configured || !enrollment.template) return NextResponse.json({ error: "Face verification service is unavailable." }, { status: 503 });

    const owner = await db.user.findUnique({ where: { id: verification.userId } });
    if (owner?.role === "DRIVER") {
      await db.driverProfile.update({
        where: { userId: verification.userId },
        data: {
          faceVerificationStatus: "PENDING_REVIEW",
          verificationStatus: "PENDING_REVIEW",
          faceLivenessResult: "PENDING_REVIEW",
          faceMatchResult: "PENDING_REVIEW",
        },
      });
    } else if (owner?.role === "RIDER") {
      await db.riderProfile.update({
        where: { userId: verification.userId },
        data: {
          faceVerificationStatus: "PENDING_REVIEW",
          verificationStatus: "PENDING_REVIEW",
          faceLivenessResult: "PENDING_REVIEW",
          faceMatchResult: "PENDING_REVIEW",
          veridexaFaceTemplate: JSON.stringify(enrollment.template),
        },
      });
    }

    await db.verificationCase.update({
      where: { id: verification.id },
      data: { status: "PENDING_REVIEW", reference: JSON.stringify({ veridexaRequestId: enrollment.requestId, quality: enrollment.quality }) },
    });

    return NextResponse.json({
      message: "Live capture received. Your first-time verification is now ready for review.",
      liveness: "PENDING_REVIEW",
      faceMatch: "PENDING_REVIEW",
    });
  } catch (error) {
    console.error("face verification", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Verification failed. Please try again." }, { status: 500 });
  }
}
