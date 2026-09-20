export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export interface Booking {
  id: string;
  rideId: string;
  riderId: string;
  seatsRequested: number;
  bags: number;
  collectionSpotName: string;
  collectionSpotType: "MALL"|"SHOPPING_CENTER"|"TRANSIT_HUB"|"PUBLIC_VENUE";
  collectionLatitude?: number|null;
  collectionLongitude?: number|null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  ride?: { pickupName: string; destinationName: string; departureDate: string; departureTime: string; driver?: { id: string; firstName: string; lastName: string; }; };
  rider?: { id: string; firstName: string; lastName: string; phone?: string; ratingAverage?: number; };
}
