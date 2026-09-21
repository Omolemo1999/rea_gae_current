import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { verifyDocumentWithVeridexa } from "@/lib/veridexa";

const allowed = ["ID", "DRIVERS_LICENCE", "VEHICLE_REGISTRATION", "VEHICLE_COMPLIANCE", "POLICE_CLEARANCE"];
const identityTypes = ["ID", "DRIVERS_LICENCE"];

function decodeDataUrl(data: string) {
  const match = data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Upload a valid document.");
  return { mimeType: match[1], bytes: Buffer.from(match[2], "base64") };
}

export async function GET() {
  const u = await getCurrentUser();
  if (!u || u.role !== "DRIVER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const docs = await db.driverDocument.findMany({ where: { driverId: u.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ documents: docs.map((d: any) => ({ ...d, data: undefined })) });
}

export async function POST(req: Request) {
  try {
    const u = await getCurrentUser();
    if (!u || u.role !== "DRIVER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const b = await req.json();
    if (!allowed.includes(b.type) || !b.fileName || !b.mimeType || !b.data) return NextResponse.json({ error: "Choose a supported document and file." }, { status: 400 });
    const { mimeType, bytes } = decodeDataUrl(String(b.data));
    if (b.type === "ID") {
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(mimeType)) return NextResponse.json({ error: "Driver ID must be captured with the camera as an image. PDF ID uploads are not supported." }, { status: 400 });
    } else if (!["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"].includes(mimeType)) {
      return NextResponse.json({ error: "Upload a PDF, JPG, PNG or WebP document." }, { status: 400 });
    }
    if (bytes.length > 5 * 1024 * 1024) return NextResponse.json({ error: b.type === "ID" ? "Captured ID image is too large. Maximum 5 MB." : "Document is too large. Maximum 5 MB." }, { status: 413 });

    let reviewNotes = "Queued for agent review.";
    {
      try {
        const result = await verifyDocumentWithVeridexa({ bytes, fileName: String(b.fileName), mimeType });
        if (result.configured) {
          const report: any = result.report;
          reviewNotes = JSON.stringify({ provider: "Veridexa", jobId: result.jobId, riskLevel: report?.riskLevel ?? null, authenticityScore: report?.authenticityScore ?? null, fraudProbability: report?.fraudProbability ?? null, confidence: report?.confidence ?? null });
        }
      } catch (error) {
        reviewNotes = `Veridexa review unavailable; manual review required. ${error instanceof Error ? error.message : ""}`.slice(0, 1000);
      }
    }

    await db.driverDocument.deleteMany({ where: { driverId: u.id, type: b.type } });
    const doc = await db.driverDocument.create({ data: { driverId: u.id, type: b.type, fileName: String(b.fileName), mimeType, data: String(b.data), status: "PENDING", reviewNotes } });
    const caseType = identityTypes.includes(b.type) ? "DRIVER_IDENTITY" : b.type === "VEHICLE_REGISTRATION" ? "VEHICLE" : "VEHICLE";
    const existing = await db.verificationCase.findFirst({ where: { userId: u.id, type: caseType, status: { in: ["IN_PROGRESS", "PENDING_REVIEW"] } } });
    if (!existing) await db.verificationCase.create({ data: { userId: u.id, type: caseType, status: "PENDING_REVIEW", documentType: b.type, reference: reviewNotes } });
    await db.driverProfile.update({ where: { userId: u.id }, data: { verificationStatus: "IN_PROGRESS", ...(identityTypes.includes(b.type) ? { identityVerificationStatus: "PENDING_REVIEW" } : {}) } });
    return NextResponse.json({ document: { ...doc, data: undefined }, message: `${String(b.type).replaceAll("_", " ")} uploaded and queued for agent review.` }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not upload document." }, { status: 500 });
  }
}
