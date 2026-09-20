export interface Rating {
  id: string;
  rideId: string;
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  score: number;
  comment: string;
  createdAt: string;
}

export interface SafetyReport {
  id: string;
  rideId?: string;
  reporterId: string;
  reportedUserId: string;
  category: "UNSAFE_DRIVING" | "IDENTITY_CONCERN" | "HARASSMENT" | "VEHICLE" | "NO_SHOW" | "OTHER";
  description: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED";
  createdAt: string;
}
