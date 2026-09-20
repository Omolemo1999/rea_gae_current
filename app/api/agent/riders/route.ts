import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const u = await getCurrentUser();
  if (!u || !["AGENT", "ADMIN"].includes(u.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const riders = await db.user.findMany({ where: { role: "RIDER" }, include: { riderProfile: true }, orderBy: { createdAt: "desc" } });
  const docs = await db.riderVerificationDocument.findMany();
  const cases = await db.verificationCase.findMany({ where: { type: "RIDER_IDENTITY" } });
  const rideVerifications = await db.riderRideVerification.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    riders: riders.map((r: any) => ({
      ...r,
      passwordHash: undefined,
      document: docs.filter((d: any) => d.riderId === r.id).sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt))[0],
      cases: cases.filter((c: any) => c.userId === r.id),
      rideVerifications: rideVerifications.filter((v: any) => v.riderId === r.id).slice(0, 10).map((v: any) => ({ ...v, tokenHash: undefined })),
    })),
  });
}
