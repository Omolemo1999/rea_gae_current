export type UserRole = "RIDER" | "DRIVER" | "AGENT" | "ADMIN";

export type AccountStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username?: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  ratingAverage: number;
  ratingCount: number;
  profilePhotoUrl?: string | null;
  createdAt: string;
}
