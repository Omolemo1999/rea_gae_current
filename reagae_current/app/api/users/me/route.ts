import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user: { ...user, passwordHash: undefined } });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.profilePhotoUrl !== undefined) {
    const photo = String(body.profilePhotoUrl || "");
    if (photo && (!photo.startsWith("data:image/") || photo.length > 2_500_000)) return NextResponse.json({ error: "Profile photo must be a supported image under 2 MB." }, { status: 413 });
  }
  const data = {
    ...(body.firstName !== undefined ? { firstName: String(body.firstName).trim() } : {}),
    ...(body.lastName !== undefined ? { lastName: String(body.lastName).trim() } : {}),
    ...(body.phone !== undefined ? { phone: String(body.phone).trim() } : {}),
    ...(body.profilePhotoUrl !== undefined ? { profilePhotoUrl: String(body.profilePhotoUrl || "") || null } : {}),
  };
  const updated = await db.user.update({ where: { id: user.id }, data });
  const { passwordHash: _, ...safe } = updated;
  return NextResponse.json({ user: safe });
}
