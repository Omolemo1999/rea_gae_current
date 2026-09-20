import {
  pgTable,
  pgEnum,
  text,
  boolean,
  integer,
  real,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("UserRole", ["RIDER", "DRIVER", "AGENT", "ADMIN"]);
export const accountStatusEnum = pgEnum("AccountStatus", ["ACTIVE", "SUSPENDED", "PENDING"]);
export const verificationStatusEnum = pgEnum("VerificationStatus", ["NOT_STARTED", "IN_PROGRESS", "PENDING_REVIEW", "VERIFIED", "REJECTED"]);
export const riderVerificationStatusEnum = pgEnum("RiderVerificationStatus", ["NOT_STARTED", "IN_PROGRESS", "PENDING_REVIEW", "VERIFIED", "REJECTED"]);
export const vehicleVerificationStatusEnum = pgEnum("VehicleVerificationStatus", ["NOT_STARTED", "PENDING_REVIEW", "VERIFIED", "REJECTED"]);
export const rideStatusEnum = pgEnum("RideStatus", ["DRAFT", "PUBLISHED", "FULL", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
export const bookingStatusEnum = pgEnum("BookingStatus", ["REQUESTED", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"]);
export const reportCategoryEnum = pgEnum("ReportCategory", ["UNSAFE_DRIVING", "IDENTITY_CONCERN", "HARASSMENT", "VEHICLE", "NO_SHOW", "OTHER"]);
export const reportStatusEnum = pgEnum("ReportStatus", ["OPEN", "UNDER_REVIEW", "RESOLVED"]);
export const verificationTypeEnum = pgEnum("VerificationType", ["RIDER_IDENTITY", "DRIVER_IDENTITY", "DRIVER_FACE", "VEHICLE"]);
export const documentTypeEnum = pgEnum("DocumentType", ["ID", "DRIVERS_LICENCE", "VEHICLE_REGISTRATION", "VEHICLE_COMPLIANCE", "POLICE_CLEARANCE"]);
export const pickupTypeEnum = pgEnum("PickupType", ["MALL", "SHOPPING_CENTER", "TRANSIT_HUB", "PUBLIC_VENUE"]);
export const driverDocumentStatusEnum = pgEnum("DriverDocumentStatus", ["PENDING", "APPROVED", "REJECTED"]);
export const paymentMethodTypeEnum = pgEnum("PaymentMethodType", ["CARD"]);
export const paymentStatusEnum = pgEnum("PaymentStatus", ["PENDING", "PAID", "FAILED", "REFUNDED"]);
export const safetyMediaTypeEnum = pgEnum("SafetyMediaType", ["AUDIO", "IMAGE", "VIDEO"]);

const common = {
  id: text("id").primaryKey(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
};

export const users = pgTable("User", {
  ...common,
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  username: text("username").unique(),
  passwordHash: text("passwordHash").notNull(),
  role: userRoleEnum("role").notNull(),
  accountStatus: accountStatusEnum("accountStatus").notNull().default("ACTIVE"),
  emailVerified: boolean("emailVerified").notNull().default(false),
  phoneVerified: boolean("phoneVerified").notNull().default(false),
  ratingAverage: real("ratingAverage").notNull().default(0),
  profilePhotoUrl: text("profilePhotoUrl"),
  legalAcceptedAt: timestamp("legalAcceptedAt", { withTimezone: true }),
  legalVersion: text("legalVersion"),
  ratingCount: integer("ratingCount").notNull().default(0),
});

export const driverProfiles = pgTable("DriverProfile", {
  userId: text("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  licenceNumber: text("licenceNumber"),
  licenceExpiry: timestamp("licenceExpiry", { withTimezone: true }),
  verificationStatus: verificationStatusEnum("verificationStatus").notNull().default("NOT_STARTED"),
  faceVerificationStatus: verificationStatusEnum("faceVerificationStatus").notNull().default("NOT_STARTED"),
  identityVerificationStatus: verificationStatusEnum("identityVerificationStatus").notNull().default("NOT_STARTED"),
  backgroundCheckStatus: verificationStatusEnum("backgroundCheckStatus").notNull().default("NOT_STARTED"),
  emergencyContactName: text("emergencyContactName"),
  emergencyContactPhone: text("emergencyContactPhone"),
  faceLivenessResult: text("faceLivenessResult"),
  faceMatchResult: text("faceMatchResult"),
  veridexaFaceTemplate: text("veridexaFaceTemplate"),
});

export const riderProfiles = pgTable("RiderProfile", {
  userId: text("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  preferredPickupNotes: text("preferredPickupNotes"),
  verificationStatus: riderVerificationStatusEnum("verificationStatus").notNull().default("NOT_STARTED"),
  emergencyContactName: text("emergencyContactName"),
  emergencyContactPhone: text("emergencyContactPhone"),
  faceVerificationStatus: verificationStatusEnum("faceVerificationStatus").notNull().default("NOT_STARTED"),
  identityVerificationStatus: verificationStatusEnum("identityVerificationStatus").notNull().default("NOT_STARTED"),
  faceLivenessResult: text("faceLivenessResult"),
  faceMatchResult: text("faceMatchResult"),
});

export const vehicles = pgTable("Vehicle", {
  ...common,
  driverId: text("driverId").notNull().references(() => users.id, { onDelete: "cascade" }),
  registrationNumber: text("registrationNumber").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  colour: text("colour").notNull(),
  seats: integer("seats").notNull(),
  luggageCapacity: integer("luggageCapacity").notNull(),
  verificationStatus: vehicleVerificationStatusEnum("verificationStatus").notNull().default("NOT_STARTED"),
}, (t) => [unique().on(t.driverId, t.registrationNumber)]);

export const rides = pgTable("Ride", {
  ...common,
  driverId: text("driverId").notNull().references(() => users.id, { onDelete: "restrict" }),
  vehicleId: text("vehicleId").notNull().references(() => vehicles.id, { onDelete: "restrict" }),
  pickupName: text("pickupName").notNull(),
  pickupLatitude: real("pickupLatitude").notNull(),
  pickupLongitude: real("pickupLongitude").notNull(),
  destinationName: text("destinationName").notNull(),
  destinationLatitude: real("destinationLatitude").notNull(),
  destinationLongitude: real("destinationLongitude").notNull(),
  departureDate: timestamp("departureDate", { withTimezone: true }).notNull(),
  departureTime: text("departureTime").notNull(),
  totalSeats: integer("totalSeats").notNull(),
  availableSeats: integer("availableSeats").notNull(),
  luggageCapacity: integer("luggageCapacity").notNull(),
  pricePerSeat: real("pricePerSeat").notNull(),
  distanceKm: real("distanceKm").notNull(),
  status: rideStatusEnum("status").notNull().default("PUBLISHED"),
}, (t) => [index("ride_departure_idx").on(t.departureDate, t.status), index("ride_route_idx").on(t.pickupName, t.destinationName)]);

export const bookings = pgTable("Booking", {
  ...common,
  rideId: text("rideId").notNull().references(() => rides.id, { onDelete: "cascade" }),
  riderId: text("riderId").notNull().references(() => users.id, { onDelete: "restrict" }),
  seatsRequested: integer("seatsRequested").notNull(),
  bags: integer("bags").notNull().default(0),
  status: bookingStatusEnum("status").notNull().default("REQUESTED"),
  collectionSpotName: text("collectionSpotName").notNull().default(""),
  collectionSpotType: pickupTypeEnum("collectionSpotType").notNull().default("MALL"),
  collectionLatitude: real("collectionLatitude"),
  collectionLongitude: real("collectionLongitude"),
}, (t) => [index("booking_rider_idx").on(t.riderId, t.status), index("booking_ride_idx").on(t.rideId, t.status), unique("booking_active_unique").on(t.rideId, t.riderId, t.status)]);

export const ratings = pgTable("Rating", {
  ...common,
  rideId: text("rideId").notNull().references(() => rides.id, { onDelete: "cascade" }),
  bookingId: text("bookingId").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  fromUserId: text("fromUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
  toUserId: text("toUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
  score: integer("score").notNull(),
  comment: text("comment").notNull().default(""),
}, (t) => [unique("rating_booking_from_unique").on(t.bookingId, t.fromUserId)]);

export const safetyReports = pgTable("SafetyReport", {
  ...common,
  rideId: text("rideId").references(() => rides.id, { onDelete: "set null" }),
  bookingId: text("bookingId").references(() => bookings.id, { onDelete: "set null" }),
  reporterId: text("reporterId").references(() => users.id, { onDelete: "set null" }),
  reportedUserId: text("reportedUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
  category: reportCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  status: reportStatusEnum("status").notNull().default("OPEN"),
});

export const verificationCases = pgTable("VerificationCase", {
  ...common,
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: verificationTypeEnum("type").notNull(),
  status: verificationStatusEnum("status").notNull().default("NOT_STARTED"),
  documentType: documentTypeEnum("documentType"),
  reference: text("reference"),
  expiresAt: timestamp("expiresAt", { withTimezone: true }),
}, (t) => [index("verification_user_type_idx").on(t.userId, t.type)]);

export const notifications = pgTable("Notification", {
  ...common,
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  readAt: timestamp("readAt", { withTimezone: true }),
}, (t) => [index("notification_user_read_idx").on(t.userId, t.readAt, t.createdAt)]);

export const emailVerificationTokens = pgTable("EmailVerificationToken", {
  ...common,
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("tokenHash").notNull().unique(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
});

export const driverDocuments = pgTable("DriverDocument", {
  ...common,
  driverId: text("driverId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: documentTypeEnum("type").notNull(),
  fileName: text("fileName").notNull(),
  mimeType: text("mimeType").notNull(),
  data: text("data").notNull(),
  status: driverDocumentStatusEnum("status").notNull().default("PENDING"),
  reviewedBy: text("reviewedBy"),
  reviewNotes: text("reviewNotes"),
}, (t) => [index("driver_document_driver_type_idx").on(t.driverId, t.type)]);

export const rideLocations = pgTable("RideLocation", {
  ...common,
  rideId: text("rideId").notNull().references(() => rides.id, { onDelete: "cascade" }),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  accuracy: real("accuracy"),
  heading: real("heading"),
  speed: real("speed"),
}, (t) => [index("ride_location_latest_idx").on(t.rideId, t.createdAt)]);

export const trackingShares = pgTable("TrackingShare", {
  ...common,
  rideId: text("rideId").notNull().references(() => rides.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  label: text("label").notNull().default("Safety contact"),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expiresAt", { withTimezone: true }),
});

export const paymentMethods = pgTable("PaymentMethod", {
  ...common,
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("PAYSTACK"),
  type: paymentMethodTypeEnum("type").notNull().default("CARD"),
  authorizationCode: text("authorizationCode"),
  brand: text("brand").notNull().default("Card"),
  last4: text("last4").notNull(),
  expMonth: integer("expMonth"),
  expYear: integer("expYear"),
  active: boolean("active").notNull().default(true),
}, (t) => [index("payment_method_user_idx").on(t.userId, t.active)]);

export const payments = pgTable("Payment", {
  ...common,
  bookingId: text("bookingId").references(() => bookings.id, { onDelete: "set null" }),
  payerId: text("payerId").notNull().references(() => users.id, { onDelete: "restrict" }),
  provider: text("provider").notNull().default("PAYSTACK"),
  reference: text("reference").notNull().unique(),
  amount: real("amount").notNull(),
  driverFee: real("driverFee").notNull().default(0),
  customerFee: real("customerFee").notNull().default(0),
  status: paymentStatusEnum("status").notNull().default("PENDING"),
  metadata: text("metadata").notNull().default("{}"),
});

export const supportCases = pgTable("SupportCase", {
  ...common,
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedAgentId: text("assignedAgentId"),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("OPEN"),
});

export const passwordResetTokens = pgTable("PasswordResetToken", {
  ...common,
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("tokenHash").notNull().unique(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  usedAt: timestamp("usedAt", { withTimezone: true }),
});


export const tips = pgTable("Tip", {
  ...common,
  bookingId: text("bookingId").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  rideId: text("rideId").notNull().references(() => rides.id, { onDelete: "cascade" }),
  fromUserId: text("fromUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
  toUserId: text("toUserId").notNull().references(() => users.id, { onDelete: "restrict" }),
  amount: real("amount").notNull(),
  paymentReference: text("paymentReference").notNull().unique(),
  status: text("status").notNull().default("PAID"),
}, (t) => [unique("tip_booking_from_unique").on(t.bookingId, t.fromUserId), index("tip_ride_idx").on(t.rideId)]);


export const riderVerificationDocuments = pgTable("RiderVerificationDocument", {
  ...common,
  riderId: text("riderId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: documentTypeEnum("type").notNull(),
  fileName: text("fileName").notNull(),
  mimeType: text("mimeType").notNull(),
  data: text("data").notNull(),
  status: driverDocumentStatusEnum("status").notNull().default("PENDING"),
  reviewedBy: text("reviewedBy"),
  reviewNotes: text("reviewNotes"),
}, (t) => [index("rider_verification_document_idx").on(t.riderId, t.type)]);

export const riderRideVerifications = pgTable("RiderRideVerification", {
  ...common,
  riderId: text("riderId").notNull().references(() => users.id, { onDelete: "cascade" }),
  rideId: text("rideId").notNull().references(() => rides.id, { onDelete: "cascade" }),
  status: verificationStatusEnum("status").notNull().default("IN_PROGRESS"),
  livenessResult: text("livenessResult"),
  faceMatchResult: text("faceMatchResult"),
  score: real("score"),
  tokenHash: text("tokenHash").unique(),
  capturedAt: timestamp("capturedAt", { withTimezone: true }),
  metadata: text("metadata").notNull().default("{}"),
}, (t) => [
  index("rider_ride_verification_lookup_idx").on(t.riderId, t.rideId, t.createdAt),
]);

export const safetyMedia = pgTable("SafetyMedia", {
  ...common,
  rideId: text("rideId").notNull().references(() => rides.id, { onDelete: "cascade" }),
  bookingId: text("bookingId").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  uploadedById: text("uploadedById").notNull().references(() => users.id, { onDelete: "restrict" }),
  type: safetyMediaTypeEnum("type").notNull(),
  fileName: text("fileName").notNull(),
  mimeType: text("mimeType").notNull(),
  sizeBytes: integer("sizeBytes").notNull(),
  durationSeconds: integer("durationSeconds"),
  data: text("data").notNull(),
});

export const supportRequests = pgTable("SupportRequest", {
  ...common,
  rideId: text("rideId").notNull().references(() => rides.id, { onDelete: "cascade" }),
  bookingId: text("bookingId").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedAgentId: text("assignedAgentId").references(() => users.id, { onDelete: "set null" }),
  status: text("status").notNull().default("WAITING"),
  subject: text("subject").notNull(),
}, (t) => [index("support_request_queue_idx").on(t.status, t.createdAt), index("support_request_ride_idx").on(t.rideId, t.bookingId)]);

export const supportMessages = pgTable("SupportMessage", {
  ...common,
  requestId: text("requestId").notNull().references(() => supportRequests.id, { onDelete: "cascade" }),
  senderId: text("senderId").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  readAt: timestamp("readAt", { withTimezone: true }),
}, (t) => [index("support_message_request_idx").on(t.requestId, t.createdAt)]);

export const experienceContents = pgTable("ExperienceContent", {
  ...common,
  slot: text("slot").notNull(),
  audience: text("audience").notNull().default("BOTH"),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  imageUrl: text("imageUrl"),
  buttonLabel: text("buttonLabel"),
  buttonHref: text("buttonHref"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sortOrder").notNull().default(0),
}, (t) => [index("experience_slot_audience_idx").on(t.slot, t.audience, t.active)]);

export const phoneVerificationCodes = pgTable("PhoneVerificationCode", {
  ...common,
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  codeHash: text("codeHash").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  usedAt: timestamp("usedAt", { withTimezone: true }),
});

export const sessions = pgTable("Session", {
  ...common,
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("tokenHash").notNull().unique(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
}, (t) => [index("session_user_expiry_idx").on(t.userId, t.expiresAt)]);

export const schema = {
  users, driverProfiles, riderProfiles, vehicles, rides, bookings, ratings,
  safetyReports, verificationCases, notifications, emailVerificationTokens,
  passwordResetTokens, phoneVerificationCodes, sessions, tips, experienceContents, riderVerificationDocuments, safetyMedia, supportRequests, supportMessages,
};
