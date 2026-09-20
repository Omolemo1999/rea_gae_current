import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const shape = (r: any, revealVehicle = false) => ({
  ...r,
  driver: r.driver ? { id: r.driver.id, firstName: r.driver.firstName, lastName: r.driver.lastName, ratingAverage: r.driver.ratingAverage, ratingCount: r.driver.ratingCount, profilePhotoUrl: r.driver.profilePhotoUrl || null } : undefined,
  vehicle: r.vehicle ? { id: r.vehicle.id, make: r.vehicle.make, model: r.vehicle.model, year: r.vehicle.year, colour: r.vehicle.colour, seats: r.vehicle.seats, luggageCapacity: r.vehicle.luggageCapacity, verificationStatus: r.vehicle.verificationStatus, ...(revealVehicle ? { registrationNumber: r.vehicle.registrationNumber } : {}) } : undefined,
  pickup: { name: r.pickupName, latitude: r.pickupLatitude, longitude: r.pickupLongitude },
  destination: { name: r.destinationName, latitude: r.destinationLatitude, longitude: r.destinationLongitude },
  departureDate: r.departureDate.toISOString().slice(0,10),
  createdAt: r.createdAt.toISOString(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ride = await db.ride.findUnique({ where: { id }, include: { driver: true, vehicle: true } });
  if (!ride) return NextResponse.json({ error: "Ride not found." }, { status: 404 });
  const user = await getCurrentUser();
  let revealVehicle = Boolean(user?.role === "DRIVER" && user.id === ride.driverId);
  if (user?.role === "RIDER") {
    const accepted = await db.booking.findFirst({ where: { rideId: ride.id, riderId: user.id, status: "ACCEPTED" } });
    revealVehicle = Boolean(accepted);
  }
  return NextResponse.json({ ride: shape(ride, revealVehicle) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ride = await db.ride.findUnique({ where: { id } });
  if (!ride) return NextResponse.json({ error: "Ride not found." }, { status: 404 });
  if (ride.driverId !== user.id) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (["IN_PROGRESS", "COMPLETED"].includes(ride.status)) return NextResponse.json({ error: "This ride can no longer be cancelled." }, { status: 409 });
  const updated = await db.ride.update({ where: { id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ride: shape(updated) });
}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); const { id } = await params; if (!user || user.role !== "DRIVER") return NextResponse.json({error:"Forbidden"},{status:403});
  const ride = await db.ride.findUnique({where:{id}}); if(!ride||ride.driverId!==user.id)return NextResponse.json({error:"Forbidden"},{status:403});
  const {status}=await req.json(); if(status!=="IN_PROGRESS"&&status!=="COMPLETED")return NextResponse.json({error:"Unsupported status"},{status:400});
  if(status==="IN_PROGRESS"&&!(["PUBLISHED","FULL"].includes(ride.status)))return NextResponse.json({error:"Ride cannot be started from its current status."},{status:409});
  if(status==="COMPLETED"&&ride.status!=="IN_PROGRESS")return NextResponse.json({error:"Ride is not in progress."},{status:409});
  const updated=await db.$transaction(async(tx)=>{const r=await tx.ride.update({where:{id},data:{status}});if(status==="COMPLETED") await tx.booking.updateMany({where:{rideId:id,status:"ACCEPTED"},data:{status:"COMPLETED"}});return r;});
  return NextResponse.json({ride:shape(updated)});
}
