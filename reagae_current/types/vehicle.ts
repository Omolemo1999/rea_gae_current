export type VehicleVerificationStatus =
  | "NOT_STARTED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export interface Vehicle {
  id: string;
  driverId: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  colour: string;
  seats: number;
  luggageCapacity: number;
  verificationStatus: VehicleVerificationStatus;
  createdAt: string;
}
