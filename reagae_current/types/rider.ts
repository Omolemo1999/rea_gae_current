export interface RiderProfile {
  userId: string;
  preferredPickupNotes: string;
  verificationStatus: "NOT_STARTED" | "IN_PROGRESS" | "VERIFIED" | "REJECTED";
  emergencyContactName: string;
  emergencyContactPhone: string;
}
