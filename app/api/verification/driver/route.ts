import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const requiredDocs = ["ID", "DRIVERS_LICENCE", "VEHICLE_REGISTRATION", "VEHICLE_COMPLIANCE", "POLICE_CLEARANCE"];

async function state(userId: string) {
  const profile = await db.driverProfile.findUnique({ where: { userId } });
  const documents = await db.driverDocument.findMany({ where: { driverId: userId }, orderBy: { createdAt: "desc" } });
  const vehicles = await db.vehicle.findMany({ where: { driverId: userId }, orderBy: { createdAt: "desc" } });
  const cases = await db.verificationCase.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return {
    profile,
    documents: documents.map((d: any) => ({ ...d, data: undefined })),
    vehicles,
    cases: cases.map((c: any) => ({ ...c, reference: undefined })),
    requirements: requiredDocs,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "DRIVER") return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  return NextResponse.json(await state(user.id));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DRIVER") return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const body = await req.json();
  const action = String(body.action || "start");
  const profile = await db.driverProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Driver profile not found." }, { status: 404 });

  if (action === "start") {
    if (profile.verificationStatus === "VERIFIED") return NextResponse.json({ ...(await state(user.id)), message: "Your driver verification is already complete." });
    await db.driverProfile.update({ where: { userId: user.id }, data: { verificationStatus: "IN_PROGRESS" } });
    const existing = await db.verificationCase.findFirst({ where: { userId: user.id, type: "DRIVER_IDENTITY", status: { in: ["IN_PROGRESS", "PENDING_REVIEW"] } } });
    if (!existing) await db.verificationCase.create({ data: { userId: user.id, type: "DRIVER_IDENTITY", status: "IN_PROGRESS" } });
    return NextResponse.json({ ...(await state(user.id)), message: "Verification started. Complete each step in order." });
  }

  if (action === "identity") {
    const licenceNumber = String(body.licenceNumber || "").trim();
    const licenceExpiry = String(body.licenceExpiry || "");
    if (!licenceNumber || !licenceExpiry || Number.isNaN(new Date(licenceExpiry).getTime())) return NextResponse.json({ error: "Enter a valid driver's licence number and expiry date." }, { status: 400 });
    await db.driverProfile.update({ where: { userId: user.id }, data: { licenceNumber, licenceExpiry: new Date(licenceExpiry), identityVerificationStatus: "PENDING_REVIEW", verificationStatus: "IN_PROGRESS" } });
    await db.verificationCase.create({ data: { userId: user.id, type: "DRIVER_IDENTITY", status: "PENDING_REVIEW", documentType: "ID" } });
    return NextResponse.json({ ...(await state(user.id)), message: "Identity details submitted. Next, complete your vehicle details and live face check." });
  }

  if (action === "submit") {
    const documents = await db.driverDocument.findMany({ where: { driverId: user.id } });
    const missing = requiredDocs.filter(type => !documents.some((d: any) => d.type === type));
    if (missing.length) return NextResponse.json({ error: `You still need: ${missing.join(", ")}.` }, { status: 400 });
    const vehicle = await db.vehicle.findFirst({ where: { driverId: user.id }, orderBy: { createdAt: "desc" } });
    if (!vehicle) return NextResponse.json({ error: "Add your vehicle details before submitting verification." }, { status: 400 });
    if (profile.faceVerificationStatus !== "PENDING_REVIEW") return NextResponse.json({ error: "Complete the live face check before submitting the verification case." }, { status: 400 });
    await db.driverProfile.update({ where: { userId: user.id }, data: { verificationStatus: "PENDING_REVIEW" } });
    return NextResponse.json({ ...(await state(user.id)), message: "Everything is submitted. ReaGae will notify you when an agent has reviewed your verification." });
  }

  return NextResponse.json({ error: "Unsupported verification action." }, { status: 400 });
}
