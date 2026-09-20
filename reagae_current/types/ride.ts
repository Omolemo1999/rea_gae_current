export type RideStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "FULL"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Place {
  name: string;
  latitude: number;
  longitude: number;
}

export interface Ride {
  id: string;
  driverId: string;
  pickup: Place;
  destination: Place;
  departureDate: string;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  luggageCapacity: number;
  pricePerSeat: number;
  distanceKm: number;
  status: RideStatus;
  createdAt: string;
  driver?: { id: string; firstName: string; lastName: string; ratingAverage: number; ratingCount: number; profilePhotoUrl?: string | null };
  vehicle?: { make: string; model: string; colour: string; seats: number; registrationNumber?: string };
}
