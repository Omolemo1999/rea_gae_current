import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { sendBookingEmail } from "@/lib/email";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const booking = await db.booking.findUnique({ where: { id }, include: { ride: true, rider: true } });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  const { status } = await req.json();

  if (user.role === "DRIVER") {
    if (booking.ride.driverId !== user.id) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (!["ACCEPTED", "REJECTED"].includes(status) || booking.status !== "REQUESTED") return NextResponse.json({ error: "Invalid booking transition." }, { status: 409 });

    if (status === "ACCEPTED") {
      const result = await db.$transaction(async (tx) => {
        const updatedRide = await tx.ride.updateMany({ where: { id: booking.rideId, availableSeats: { gte: booking.seatsRequested }, status: { in: ["PUBLISHED", "FULL"] } }, data: { availableSeats: { decrement: booking.seatsRequested } } });
        if (updatedRide.count !== 1) throw new Error("SEATS_UNAVAILABLE");
        const updatedBooking = await tx.booking.update({ where: { id }, data: { status: "ACCEPTED" } });
        const ride = await tx.ride.findUnique({ where: { id: booking.rideId } });
        if (ride && ride.availableSeats === 0) { await tx.ride.update({ where: { id: ride.id }, data: { status: "FULL" } }); }
        return updatedBooking;
      }).catch((e) => { if (e instanceof Error && e.message === "SEATS_UNAVAILABLE") return null; throw e; });
      if (!result) return NextResponse.json({ error: "Not enough seats remain." }, { status: 409 });
      const currentRide = await db.ride.findUnique({ where: { id: booking.rideId } });
      if (currentRide?.availableSeats === 0) {
        await createNotification({ userId: booking.ride.driverId, title: "Ride is full", message: "All seats are booked. Be prepared to depart on the scheduled date and time.", type: "RIDE_FULL" });
        const riders = await db.booking.findMany({ where: { rideId: booking.rideId, status: "ACCEPTED" }, select: { riderId: true } });
        for (const rider of riders) await createNotification({ userId: rider.riderId, title: "Ride is full", message: "This ride is now full. Please be ready at your selected collection point for the scheduled departure.", type: "RIDE_FULL" });
      }
      await createNotification({ userId: booking.riderId, title: "Booking accepted", message: `Your booking for ${booking.ride.pickupName} → ${booking.ride.destinationName} was accepted.`, type: "BOOKING_ACCEPTED" });
      await sendBookingEmail(booking.rider.email, booking.rider.firstName, "Your ReaGae booking was accepted", `Your booking from ${booking.ride.pickupName} to ${booking.ride.destinationName} was accepted by the driver.`);
      return NextResponse.json({ booking: result });
    }

    const updated = await db.booking.update({ where: { id }, data: { status: "REJECTED" } });
    await createNotification({ userId: booking.riderId, title: "Booking declined", message: `Your booking for ${booking.ride.pickupName} → ${booking.ride.destinationName} was declined.`, type: "BOOKING_REJECTED" });
    await sendBookingEmail(booking.rider.email, booking.rider.firstName, "ReaGae booking update", `Your booking for ${booking.ride.pickupName} to ${booking.ride.destinationName} was declined.`);
    return NextResponse.json({ booking: updated });
  }

  if (user.role === "RIDER" && booking.riderId === user.id && status === "CANCELLED" && ["REQUESTED", "ACCEPTED"].includes(booking.status)) {
    const updated = await db.$transaction(async (tx) => {
      const result = await tx.booking.update({ where: { id }, data: { status: "CANCELLED" } });
      if (booking.status === "ACCEPTED") await tx.ride.update({ where: { id: booking.rideId }, data: { availableSeats: { increment: booking.seatsRequested }, status: "PUBLISHED" } });
      return result;
    });
    await createNotification({ userId: booking.ride.driverId, title: "Booking cancelled", message: `${user.firstName} cancelled a booking on your ride.`, type: "BOOKING_CANCELLED" });
    return NextResponse.json({ booking: updated });
  }
  return NextResponse.json({ error: "Forbidden." }, { status: 403 });
}
