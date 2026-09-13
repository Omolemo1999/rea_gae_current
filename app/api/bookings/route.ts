import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { sendBookingEmail } from "@/lib/email";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await db.booking.findMany({
    where: user.role === "RIDER" ? { riderId: user.id } : { ride: { driverId: user.id } },
    include: { ride: { include: { driver: { select: { id: true, firstName: true, lastName: true, phone: true, ratingAverage: true }, }, vehicle: true } }, rider: { select: { id: true, firstName: true, lastName: true, phone: true, ratingAverage: true } } },
    orderBy: { createdAt: "desc" },
  });
  const safeBookings = bookings.map((b:any) => {
    if (user.role !== "RIDER") return b;
    const accepted = b.status === "ACCEPTED" || b.status === "COMPLETED";
    return { ...b, ride: b.ride ? { ...b.ride, driver: b.ride.driver ? { ...b.ride.driver, phone: accepted ? b.ride.driver.phone : undefined } : undefined, vehicle: b.ride.vehicle ? { ...b.ride.vehicle, registrationNumber: accepted ? b.ride.vehicle.registrationNumber : undefined } : undefined } : b.ride };
  });
  return NextResponse.json({ bookings: safeBookings });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "RIDER") return NextResponse.json({ error: "Only riders can request bookings." }, { status: 403 });
  if (!user.emailVerified || !user.phoneVerified) return NextResponse.json({ error: "Verify your email and phone before requesting a ride." }, { status: 403 });

  const { rideId, seatsRequested, bags, collectionSpot, paymentReference } = await req.json();
  const seats = Number(seatsRequested);
  const bagCount = Number(bags || 0);
  const payment = paymentReference ? await db.payment.findUnique({ where: { reference: String(paymentReference) } }) : null;
  if (!payment || payment.payerId !== user.id || payment.status !== "PAID") return NextResponse.json({ error: "A successful card payment is required before requesting a ride." }, { status: 402 });
  if (!collectionSpot?.name || !["MALL","SHOPPING_CENTER","TRANSIT_HUB","PUBLIC_VENUE"].includes(collectionSpot.type)) return NextResponse.json({ error: "Choose a public collection point such as a mall or shopping centre. Home addresses are not allowed." }, { status: 400 });
  if (!Number.isInteger(seats) || seats < 1 || !Number.isInteger(bagCount) || bagCount < 0) return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });

  const ride = await db.ride.findUnique({ where: { id: String(rideId) }, include: { driver: true } });
  if (!ride || ride.status === "CANCELLED" || ride.departureDate < new Date()) return NextResponse.json({ error: "Ride unavailable." }, { status: 404 });
  if (seats > ride.availableSeats) return NextResponse.json({ error: "Requested seats are not available." }, { status: 400 });
  if (bagCount > ride.luggageCapacity) return NextResponse.json({ error: "Requested luggage exceeds the ride capacity." }, { status: 400 });

  const existing = await db.booking.findFirst({ where: { rideId: ride.id, riderId: user.id, status: { in: ["REQUESTED", "ACCEPTED"] } } });
  if (existing) return NextResponse.json({ error: "You already have an active booking for this ride." }, { status: 409 });

  const booking = await db.booking.create({ data: { rideId: ride.id, riderId: user.id, seatsRequested: seats, bags: bagCount, status: "REQUESTED", collectionSpotName: String(collectionSpot.name).trim(), collectionSpotType: collectionSpot.type, collectionLatitude: Number.isFinite(Number(collectionSpot.latitude)) ? Number(collectionSpot.latitude) : null, collectionLongitude: Number.isFinite(Number(collectionSpot.longitude)) ? Number(collectionSpot.longitude) : null }, include: { ride: true } });
  await createNotification({ userId: ride.driverId, title: "New booking request", message: `${user.firstName} requested ${seats} seat${seats > 1 ? "s" : ""} on your ride to ${ride.destinationName}.`, type: "BOOKING_REQUEST" });
  await sendBookingEmail(ride.driver.email, ride.driver.firstName, "New ReaGae booking request", `${user.firstName} requested ${seats} seat(s) on your ride from ${ride.pickupName} to ${ride.destinationName}.`);
  return NextResponse.json({ booking }, { status: 201 });
}
