import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hashToken, randomToken } from "@/lib/security";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !["DRIVER", "RIDER"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const mode = String(body.mode || "INITIAL").toUpperCase();

  if (user.role === "RIDER" && mode === "RIDE") {
    const rideId = String(body.rideId || "");
    if (!rideId) return NextResponse.json({ error: "A ride must be selected." }, { status: 400 });

    const ride = await db.ride.findUnique({ where: { id: rideId } });
    if (!ride || ride.status === "CANCELLED" || ride.departureDate < new Date()) {
      return NextResponse.json({ error: "That ride is no longer available." }, { status: 404 });
    }

    const rider = await db.riderProfile.findUnique({ where: { userId: user.id } });
    const riderIdDocument = await db.riderVerificationDocument.findFirst({
      where: { riderId: user.id, type: "ID", status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    if (!riderIdDocument || rider.verificationStatus !== "VERIFIED") {
      return NextResponse.json({ error: "Complete your first-time rider verification before requesting a ride." }, { status: 403 });
    }

    const token = randomToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db.riderRideVerification.create({
      data: {
        riderId: user.id,
        rideId,
        status: "IN_PROGRESS",
        tokenHash: hashToken(token),
        metadata: JSON.stringify({ purpose: "RIDE_REQUEST_IDENTITY", rideId }),
      },
    });

    const origin = process.env.APP_URL || new URL(req.url).origin;
    return NextResponse.json({
      status: "IN_PROGRESS",
      mode: "RIDE",
      url: `${origin}/verify/face/${encodeURIComponent(token)}?mode=ride&rideId=${encodeURIComponent(rideId)}`,
      expiresAt,
      message: "Complete the live face check. It is recorded against this ride request and does not require agent approval.",
    });
  }

  const token = randomToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.verificationCase.deleteMany({
    where: {
      userId: user.id,
      type: user.role === "DRIVER" ? "DRIVER_FACE" : "RIDER_IDENTITY",
      status: { in: ["IN_PROGRESS", "PENDING_REVIEW"] },
    },
  });

  await db.verificationCase.create({
    data: {
      userId: user.id,
      type: user.role === "DRIVER" ? "DRIVER_FACE" : "RIDER_IDENTITY",
      status: "IN_PROGRESS",
      reference: hashToken(token),
      expiresAt,
    },
  });

  if (user.role === "DRIVER") {
    await db.driverProfile.update({
      where: { userId: user.id },
      data: { faceVerificationStatus: "IN_PROGRESS", verificationStatus: "IN_PROGRESS", faceLivenessResult: null, faceMatchResult: null },
    });
  } else {
    await db.riderProfile.update({
      where: { userId: user.id },
      data: { faceVerificationStatus: "IN_PROGRESS", verificationStatus: "IN_PROGRESS", faceLivenessResult: null, faceMatchResult: null },
    });
  }

  const origin = process.env.APP_URL || new URL(req.url).origin;
  return NextResponse.json({
    status: "IN_PROGRESS",
    mode: "INITIAL",
    url: `${origin}/verify/face/${encodeURIComponent(token)}`,
    expiresAt,
    message: "Open the secure verification link and complete the live camera check.",
  });
}
