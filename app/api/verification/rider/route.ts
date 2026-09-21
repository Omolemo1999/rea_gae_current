import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { verifyDocumentWithVeridexa } from "@/lib/veridexa";

function decodeDataUrl(data: string) {
  const match = data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Capture a valid ID image with the camera.");
  return { mimeType: match[1], bytes: Buffer.from(match[2], "base64") };
}

export async function GET() {
  const u = await getCurrentUser();
  if (!u || u.role !== "RIDER") return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const profile = await db.riderProfile.findUnique({ where: { userId: u.id } });
  const doc = await db.riderVerificationDocument.findFirst({
    where: { riderId: u.id, type: "ID" },
    orderBy: { createdAt: "desc" },
    select: { id: true, fileName: true, mimeType: true, status: true, createdAt: true, reviewNotes: true },
  });
  return NextResponse.json({ profile, document: doc });
}

export async function POST(req: Request) {
  try {
    const u = await getCurrentUser();
    if (!u || u.role !== "RIDER") return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const b = await req.json();
    const data = String(b.data || "");
    const { mimeType, bytes } = decodeDataUrl(data);

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(mimeType)) {
      return NextResponse.json({ error: "Your ID must be captured with the camera as a JPG, PNG or WebP image. PDF identity uploads are not supported." }, { status: 400 });
    }
    if (bytes.length > 5 * 1024 * 1024) return NextResponse.json({ error: "Captured ID image is too large. Maximum 5 MB." }, { status: 413 });

    const existing = await db.riderVerificationDocument.findFirst({ where: { riderId: u.id, type: "ID" }, orderBy: { createdAt: "desc" } });
    if (existing?.status === "APPROVED") return NextResponse.json({ error: "Your ID is already approved." }, { status: 409 });

    let reviewNotes = "Queued for agent review.";
    {
      try {
        const result = await verifyDocumentWithVeridexa({ bytes, fileName: String(b.fileName || "identity-document"), mimeType });
        if (result.configured) {
          const report: any = result.report;
          reviewNotes = JSON.stringify({
            provider: "Veridexa",
            jobId: result.jobId,
            riskLevel: report?.riskLevel ?? null,
            authenticityScore: report?.authenticityScore ?? null,
            fraudProbability: report?.fraudProbability ?? null,
            confidence: report?.confidence ?? null,
          });
        } else reviewNotes = "Veridexa is not configured; document queued for manual review.";
      } catch (error) {
        reviewNotes = `Veridexa review unavailable; manual review required. ${error instanceof Error ? error.message : ""}`.slice(0, 1000);
      }
    }

    const doc = await db.riderVerificationDocument.create({
      data: { riderId: u.id, type: "ID", fileName: String(b.fileName || "identity-document"), mimeType, data, status: "PENDING", reviewNotes },
    });

    await db.riderProfile.update({
      where: { userId: u.id },
      data: { identityVerificationStatus: "PENDING_REVIEW", verificationStatus: "IN_PROGRESS" },
    });

    await db.verificationCase.create({ data: { userId: u.id, type: "RIDER_IDENTITY", status: "PENDING_REVIEW", documentType: "ID", reference: reviewNotes } });

    return NextResponse.json({
      document: { id: doc.id, fileName: doc.fileName, status: doc.status, reviewNotes },
      message: "ID captured successfully. Complete the live face check next; CompreFace will compare your live face with the face visible on this captured ID.",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not upload your ID." }, { status: 500 });
  }
}
