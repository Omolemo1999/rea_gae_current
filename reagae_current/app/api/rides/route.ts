import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateDistanceKm, calculateRidePrice } from "@/lib/pricing";

function serializeRide(ride: any) {
  return {
    id: ride.id,
    driverId: ride.driverId,
    driver: ride.driver ? { id: ride.driver.id, firstName: ride.driver.firstName, lastName: ride.driver.lastName, ratingAverage: ride.driver.ratingAverage, ratingCount: ride.driver.ratingCount, profilePhotoUrl: ride.driver.profilePhotoUrl || null } : undefined,
    vehicle: ride.vehicle ? { make: ride.vehicle.make, model: ride.vehicle.model, colour: ride.vehicle.colour, seats: ride.vehicle.seats } : undefined,
    pickup: { name: ride.pickupName, latitude: ride.pickupLatitude, longitude: ride.pickupLongitude },
    destination: { name: ride.destinationName, latitude: ride.destinationLatitude, longitude: ride.destinationLongitude },
    departureDate: ride.departureDate.toISOString().slice(0, 10),
    departureTime: ride.departureTime,
    totalSeats: ride.totalSeats,
    availableSeats: ride.availableSeats,
    luggageCapacity: ride.luggageCapacity,
    pricePerSeat: ride.pricePerSeat,
    distanceKm: ride.distanceKm,
    status: ride.status,
    createdAt: ride.createdAt.toISOString(),
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const user = await getCurrentUser();
  const pickup = url.searchParams.get("pickup")?.trim().toLowerCase();
  const destination = url.searchParams.get("destination")?.trim().toLowerCase();
  const date = url.searchParams.get("date");
  const rides = await db.ride.findMany({
    where: {
      ...(user?.role === "DRIVER" ? { driverId: user.id, status: { in: ["PUBLISHED", "FULL", "IN_PROGRESS", "COMPLETED"] } } : { status: { in: ["PUBLISHED", "FULL"] } }),
      ...(pickup ? { pickupName: { contains: pickup, mode: "insensitive" } } : {}),
      ...(destination ? { destinationName: { contains: destination, mode: "insensitive" } } : {}),
      ...(date ? { departureDate: { gte: new Date(`${date}T00:00:00.000Z`), lt: new Date(`${date}T23:59:59.999Z`) } } : {}),
    },
    include: { driver: true, vehicle: true },
    orderBy: [{ departureDate: "asc" }, { departureTime: "asc" }],
  });
  return NextResponse.json({ rides: rides.map(serializeRide) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "DRIVER") return NextResponse.json({ error: "Only drivers can create rides." }, { status: 403 });
  if (user.accountStatus !== "ACTIVE") return NextResponse.json({ error: "Your driver account is currently blocked or inactive." }, { status: 403 });
  if (!user.emailVerified || !user.phoneVerified) return NextResponse.json({ error: "Verify your email and phone before publishing a ride." }, { status: 403 });

  const profile = await db.driverProfile.findUnique({ where: { userId: user.id } });
  const vehicle = await db.vehicle.findFirst({ where: { driverId: user.id, verificationStatus: "VERIFIED" }, orderBy: { createdAt: "desc" } });
  const docs = await db.driverDocument.findMany({ where: { driverId: user.id, status: "APPROVED" } });
  const requiredDocs = ["VEHICLE_REGISTRATION","VEHICLE_COMPLIANCE","POLICE_CLEARANCE"];
  const documentsComplete = requiredDocs.every((type) => docs.some((d:any) => d.type === type));
  if (!profile || profile.verificationStatus !== "VERIFIED" || profile.faceVerificationStatus !== "VERIFIED" || profile.identityVerificationStatus !== "VERIFIED" || profile.backgroundCheckStatus !== "VERIFIED" || !vehicle || !documentsComplete) {
    return NextResponse.json({ error: "Driver identity, face/liveness, background and vehicle verification must all be completed before publishing a ride." }, { status: 403 });
  }

  const b = await req.json();
  const pickup = b.pickup;
  const destination = b.destination;
  const totalSeats = Number(b.totalSeats);
  const luggageCapacity = Number(b.luggageCapacity);
  if (!pickup?.name || !destination?.name || !b.departureDate || !b.departureTime || !Number.isInteger(totalSeats) || totalSeats < 1 || totalSeats > vehicle.seats || !Number.isInteger(luggageCapacity) || luggageCapacity < 0 || luggageCapacity > 20) {
    return NextResponse.json({ error: "Invalid ride details." }, { status: 400 });
  }
  if (![pickup.latitude, pickup.longitude, destination.latitude, destination.longitude].every((v) => Number.isFinite(Number(v)))) return NextResponse.json({ error: "Valid pickup and destination coordinates are required." }, { status: 400 });
  const departure = new Date(`${b.departureDate}T${b.departureTime}:00`);
  if (Number.isNaN(departure.getTime()) || departure <= new Date()) return NextResponse.json({ error: "Departure must be a valid future date and time." }, { status: 400 });
  const distanceKm = calculateDistanceKm(pickup, destination);
  const pricePerSeat = calculateRidePrice({ distanceKm, seats: totalSeats, luggageBags: luggageCapacity });
  const ride = await db.ride.create({ data: {
    driverId: user.id, vehicleId: vehicle.id,
    pickupName: String(pickup.name).trim(), pickupLatitude: Number(pickup.latitude), pickupLongitude: Number(pickup.longitude),
    destinationName: String(destination.name).trim(), destinationLatitude: Number(destination.latitude), destinationLongitude: Number(destination.longitude),
    departureDate: new Date(`${b.departureDate}T00:00:00.000Z`), departureTime: String(b.departureTime), totalSeats, availableSeats: totalSeats,
    luggageCapacity, pricePerSeat, distanceKm, status: "PUBLISHED",
  }, include: { driver: true, vehicle: true } });
  return NextResponse.json({ ride: serializeRide(ride) }, { status: 201 });
}
