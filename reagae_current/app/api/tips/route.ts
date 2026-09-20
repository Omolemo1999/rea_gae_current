import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { paystackRequest, kobo } from "@/lib/payments";
import crypto from "node:crypto";

const allowed = [10, 20, 30, 50, 100];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ tips: await db.tip.findMany({ where: { fromUserId: user.id }, orderBy: { createdAt: "desc" } }) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "RIDER") return NextResponse.json({ error: "Only riders can tip." }, { status: 403 });
  const body = await req.json();
  const amount = Number(body.amount);
  if (!allowed.includes(amount)) return NextResponse.json({ error: "Choose a tip of R10, R20, R30, R50 or R100." }, { status: 400 });
  const booking = await db.booking.findUnique({ where: { id: String(body.bookingId) }, include: { ride: true } });
  if (!booking || booking.riderId !== user.id || booking.status !== "COMPLETED") return NextResponse.json({ error: "Tips are available only after your completed ride." }, { status: 400 });
  if (await db.tip.findFirst({ where: { bookingId: booking.id, fromUserId: user.id } })) return NextResponse.json({ error: "You have already tipped this ride." }, { status: 409 });
  const method = await db.paymentMethod.findFirst({ where: { userId: user.id, active: true }, orderBy: { createdAt: "desc" } });
  if (!method?.authorizationCode) return NextResponse.json({ error: "Add a saved card before sending a tip." }, { status: 402 });
  try {
    const reference = `RG-TIP-${crypto.randomUUID()}`;
    const payment = await paystackRequest("transaction/charge_authorization", { authorization_code: method.authorizationCode, email: user.email, amount: kobo(amount), reference, metadata: { purpose: "TIP", bookingId: booking.id, rideId: booking.rideId, userId: user.id } });
    const status = String(payment.status || "").toLowerCase();
    if (status !== "success") return NextResponse.json({ error: "Your card could not be charged for the tip." }, { status: 402 });
    const tip = await db.tip.create({ data: { bookingId: booking.id, rideId: booking.rideId, fromUserId: user.id, toUserId: booking.ride.driverId, amount, paymentReference: reference, status: "PAID" } });
    return NextResponse.json({ tip }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Tip payment failed." }, { status: 402 });
  }
}
