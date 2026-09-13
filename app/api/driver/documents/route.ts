import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const allowed = ["ID", "DRIVERS_LICENCE", "VEHICLE_REGISTRATION", "VEHICLE_COMPLIANCE", "POLICE_CLEARANCE"];
const identityTypes = ["ID", "DRIVERS_LICENCE"];

export async function GET() {
  const u = await getCurrentUser();
  if (!u || u.role !== "DRIVER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const docs = await db.driverDocument.findMany({ where: { driverId: u.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ documents: docs.map((d: any) => ({ ...d, data: undefined })) });
}

export async function POST(req: Request) {
  const u = await getCurrentUser();
  if (!u || u.role !== "DRIVER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json();
  if (!allowed.includes(b.type) || !b.fileName || !b.mimeType || !b.data) return NextResponse.json({ error: "Choose a supported document and file." }, { status: 400 });
  if (!String(b.mimeType).startsWith("image/") && b.mimeType !== "application/pdf") return NextResponse.json({ error: "Upload an image or PDF document." }, { status: 400 });
  if (String(b.data).length > 8_000_000) return NextResponse.json({ error: "Document is too large. Please keep uploads under 6 MB." }, { status: 413 });

  await db.driverDocument.deleteMany({ where: { driverId: u.id, type: b.type } });
  const doc = await db.driverDocument.create({ data: { driverId: u.id, type: b.type, fileName: String(b.fileName), mimeType: String(b.mimeType), data: String(b.data), status: "PENDING" } });
  const caseType = identityTypes.includes(b.type) ? "DRIVER_IDENTITY" : b.type === "VEHICLE_REGISTRATION" ? "VEHICLE" : "VEHICLE";
  const existing = await db.verificationCase.findFirst({ where: { userId: u.id, type: caseType, status: { in: ["IN_PROGRESS", "PENDING_REVIEW"] } } });
  if (!existing) await db.verificationCase.create({ data: { userId: u.id, type: caseType, status: "PENDING_REVIEW", documentType: b.type } });
  await db.driverProfile.update({ where: { userId: u.id }, data: { verificationStatus: "IN_PROGRESS", ...(identityTypes.includes(b.type) ? { identityVerificationStatus: "PENDING_REVIEW" } : {}) } });
  return NextResponse.json({ document: { ...doc, data: undefined }, message: `${String(b.type).replaceAll("_", " ")} uploaded and queued for agent review.` }, { status: 201 });
}
