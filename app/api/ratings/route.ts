import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ratings = await db.rating.findMany({ where: { OR: [{ fromUserId: user.id }, { toUserId: user.id }] }, include: { fromUser: { select: { firstName: true, lastName: true } }, toUser: { select: { firstName: true, lastName: true } }, ride: { select: { pickupName: true, destinationName: true, departureDate: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ratings });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const ride = await db.ride.findUnique({ where: { id: String(b.rideId) } });
  const booking = await db.booking.findUnique({ where: { id: String(b.bookingId) } });
  if (!ride || !booking || booking.rideId !== ride.id || booking.status !== "COMPLETED") return NextResponse.json({ error: "A completed booking is required." }, { status: 400 });

  const isRider = booking.riderId === user.id;
  const isDriver = ride.driverId === user.id;
  if (!isRider && !isDriver) return NextResponse.json({ error: "You did not participate in this trip." }, { status: 403 });
  const toUserId = isRider ? ride.driverId : booking.riderId;
  const score = Number(b.score);
  if (!Number.isInteger(score) || score < 1 || score > 5) return NextResponse.json({ error: "Score must be an integer from 1 to 5." }, { status: 400 });
  if (await db.rating.findFirst({ where: { bookingId: booking.id, fromUserId: user.id } })) return NextResponse.json({ error: "You have already rated this participant." }, { status: 409 });

  const rating = await db.$transaction(async (tx) => {
    const created = await tx.rating.create({ data: { rideId: ride.id, bookingId: booking.id, fromUserId: user.id, toUserId, score, comment: String(b.comment || "").trim() } });
    const aggregate = await tx.rating.aggregate({ where: { toUserId }, _avg: { score: true }, _count: { id: true } });
    await tx.user.update({ where: { id: toUserId }, data: { ratingAverage: aggregate._avg.score || 0, ratingCount: aggregate._count.id } });
    return created;
  });
  return NextResponse.json({ rating }, { status: 201 });
}
