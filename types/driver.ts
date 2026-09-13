export type DriverVerificationStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export interface DriverProfile {
  userId: string;
  licenceNumber: string;
  licenceExpiry: string;
  verificationStatus: DriverVerificationStatus;
  faceVerificationStatus: DriverVerificationStatus;
  identityVerificationStatus: DriverVerificationStatus;
  backgroundCheckStatus: DriverVerificationStatus;
  emergencyContactName: string;
  emergencyContactPhone: string;
}
