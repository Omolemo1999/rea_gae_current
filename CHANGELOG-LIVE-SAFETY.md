# ReaGae Live Safety & Trust Update

## Rider identity verification
- Riders must verify before booking.
- Required flow: government ID -> live phone camera face capture -> agent review -> approval.
- ID and face/liveness results are stored against the rider verification case.
- Booking API enforces `RiderProfile.verificationStatus = VERIFIED`.

## Email security
- Login is blocked until email verification is complete.
- Unverified users can request a fresh verification email.
- Password reset remains tokenised, expiring and single-use; active sessions are invalidated after reset.

## Ride safety
- Riders and drivers can report a safety concern against the exact booking and ride.
- Driver receives the same safety actions as the rider for accepted/completed journeys.
- Optional safety evidence supports up to 3 files per person per ride and 12 MB total, with a 5 MB per-file limit.
- Evidence can be an image, short video, or browser microphone recording (up to 60 seconds).
- Recording is never automatic; the user must explicitly start it and grant microphone permission.

## Ride-linked support
- Support is opened from a specific booking/ride.
- The request enters an agent queue and active agents are notified.
- An agent accepts the request and the customer is connected to a dedicated live-style chat window.
- Chat polls for new messages and keeps the ride/booking context attached.

## Rider/driver transparency
- Driver profile photo is visible on ride information.
- Vehicle registration/number plate is revealed only after a rider's booking is accepted.

## Database
Run the new migration with the existing workflow:

```bash
npm install
npm run db:push
```

Migration: `drizzle/0005_safety_rider_support.sql`
