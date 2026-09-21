import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";
import { comprefaceConfigured, verifyFaces } from "@/lib/compreface";

function dataUrlToBuffer(value: string) {
  const match = value.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/);
  if (!match) throw new Error("A valid camera image is required.");
  const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length) throw new Error("The camera produced an empty image. Please retake it.");
  return { mimeType, bytes };
}

function documentToBuffer(data: string, mimeType: string) {
  const match = String(data || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("The stored identity ID image is invalid. Please recapture the front of your ID with the camera.");
  const actualMime = match[1] || mimeType;
  if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(actualMime)) {
    throw new Error("The identity document must be a camera-captured JPG, PNG or WebP image. Please recapture the front of the ID.");
  }
  return { mimeType: actualMime === "image/jpg" ? "image/jpeg" : actualMime, bytes: Buffer.from(match[2], "base64") };
}

function providerStatus(message: string) {
  const match = message.match(/CompreFace .* failed \((\d{3})\)/);
  if (!match) return 500;
  const code = Number(match[1]);
  if (code === 400 || code === 422) return 422;
  if (code === 401 || code === 403) return 503;
  if (code === 429) return 429;
  if (code >= 500) return 502;
  return 502;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || "");
    const selfie = String(body.selfie || "");
    if (!token || !selfie) return NextResponse.json({ error: "Live face capture is required." }, { status: 400 });

    const live = dataUrlToBuffer(selfie);
    if (live.bytes.length > 4_000_000) return NextResponse.json({ error: "Capture is too large. Please retake it." }, { status: 413 });
    if (!comprefaceConfigured()) return NextResponse.json({ error: "Face verification is not configured. Set COMPREFACE_VERIFICATION_API_KEY on the server." }, { status: 503 });

    const rideVerification = await db.riderRideVerification.findUnique({ where: { tokenHash: hashToken(token) } });
    if (rideVerification && rideVerification.status === "IN_PROGRESS") {
      const riderDoc = await db.riderVerificationDocument.findFirst({ where: { riderId: rideVerification.riderId, type: "ID" }, orderBy: { createdAt: "desc" } });
      if (!riderDoc) return NextResponse.json({ error: "Your verified ID image is missing. Please complete your rider identity verification again." }, { status: 409 });
      const reference = documentToBuffer(riderDoc.data, riderDoc.mimeType);
      const comparison = await verifyFaces(live, reference);
      if (!comparison.configured) return NextResponse.json({ error: "Face verification service is unavailable." }, { status: 503 });
      const passed = comparison.passed;
      await db.riderRideVerification.update({
        where: { id: rideVerification.id },
        data: {
          status: passed ? "VERIFIED" : "REJECTED",
          livenessResult: "NOT_ASSESSED",
          faceMatchResult: passed ? "PASSED" : "FAILED",
          score: comparison.similarity,
          capturedAt: new Date(),
          tokenHash: null,
          metadata: JSON.stringify({ provider: "CompreFace", similarity: comparison.similarity, threshold: comparison.threshold, sourceProbability: comparison.sourceProbability, targetProbability: comparison.targetProbability, purpose: "RIDE_REQUEST_IDENTITY" }),
        },
      });
      return NextResponse.json({
        message: passed ? "Identity confirmed for this ride request." : "The live face did not match the verified ID photo. Please retake the capture with your face clearly visible.",
        rideVerification: { status: passed ? "VERIFIED" : "REJECTED", score: comparison.similarity },
      });
    }

    const verification = await db.verificationCase.findFirst({
      where: { type: { in: ["DRIVER_FACE", "RIDER_IDENTITY"] }, reference: hashToken(token), status: "IN_PROGRESS" },
    });
    if (!verification || !verification.expiresAt || verification.expiresAt <= new Date()) {
      return NextResponse.json({ error: "This verification link has expired. Start a new verification." }, { status: 400 });
    }

    const driverDoc = await db.driverDocument.findFirst({ where: { driverId: verification.userId, type: "ID" }, orderBy: { createdAt: "desc" } });
    const riderDoc = await db.riderVerificationDocument.findFirst({ where: { riderId: verification.userId, type: "ID" }, orderBy: { createdAt: "desc" } });
    const identityDoc = driverDoc || riderDoc;
    if (!identityDoc) return NextResponse.json({ error: "Capture the front of your ID with the camera before the live face check." }, { status: 400 });
    if (identityDoc.mimeType === "application/pdf") return NextResponse.json({ error: "PDF identity documents are no longer accepted for biometric matching. Recapture the front of your ID with the camera." }, { status: 422 });

    const reference = documentToBuffer(identityDoc.data, identityDoc.mimeType);
    const comparison = await verifyFaces(live, reference);
    if (!comparison.configured) return NextResponse.json({ error: "Face verification service is unavailable." }, { status: 503 });

    const owner = await db.user.findUnique({ where: { id: verification.userId } });
    const passed = comparison.passed;
    if (owner?.role === "DRIVER") {
      await db.driverProfile.update({
        where: { userId: verification.userId },
        data: {
          faceVerificationStatus: passed ? "PENDING_REVIEW" : "REJECTED",
          verificationStatus: "IN_PROGRESS",
          faceLivenessResult: "NOT_ASSESSED",
          faceMatchResult: passed ? "PASSED" : "FAILED",
          veridexaFaceTemplate: null,
        },
      });
    } else if (owner?.role === "RIDER") {
      await db.riderProfile.update({
        where: { userId: verification.userId },
        data: {
          faceVerificationStatus: passed ? "PENDING_REVIEW" : "REJECTED",
          verificationStatus: passed ? "PENDING_REVIEW" : "REJECTED",
          faceLivenessResult: "NOT_ASSESSED",
          faceMatchResult: passed ? "PASSED" : "FAILED",
          veridexaFaceTemplate: null,
        },
      });
    }

    await db.verificationCase.update({
      where: { id: verification.id },
      data: {
        status: passed ? "PENDING_REVIEW" : "IN_PROGRESS",
        reference: JSON.stringify({ provider: "CompreFace", similarity: comparison.similarity, threshold: comparison.threshold, sourceProbability: comparison.sourceProbability, targetProbability: comparison.targetProbability }),
      },
    });

    if (!passed) {
      return NextResponse.json({ error: `Face did not match the identity document (similarity ${comparison.similarity.toFixed(3)}; required ${comparison.threshold.toFixed(3)}). Please retake the photo.` }, { status: 422 });
    }

    return NextResponse.json({
      message: "Face matched the identity document successfully. Continue to the next verification step.",
      liveness: "NOT_ASSESSED",
      faceMatch: "PASSED",
      similarity: comparison.similarity,
      threshold: comparison.threshold,
    });
  } catch (error) {
    console.error("face verification", error);
    const message = error instanceof Error ? error.message : "Verification failed. Please try again.";
    return NextResponse.json({ error: message }, { status: providerStatus(message) });
  }
}
