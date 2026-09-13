export type VerificationDocument =
  | "ID"
  | "DRIVERS_LICENCE"
  | "VEHICLE_REGISTRATION";

export interface VerificationCase {
  id: string;
  userId: string;
  type: "RIDER_IDENTITY" | "DRIVER_IDENTITY" | "DRIVER_FACE" | "VEHICLE";
  status: "NOT_STARTED" | "IN_PROGRESS" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  documentType?: VerificationDocument;
  createdAt: string;
  updatedAt: string;
}
