# ReaGae — Enterprise Ride Sharing Platform

ReaGae is a responsive Next.js + MUI ride-sharing platform for South Africa. This update adds a real-time safety tracking workflow, cashless card payments, driver compliance operations, agent/back-office dashboards and stronger booking controls.

## Major capabilities

### Rider experience
- Search and request rides.
- Every booking requires a public collection point: mall, shopping centre, transit hub or public venue. Home addresses are rejected by the API.
- No cash payments. The booking flow sends the rider to a secure Paystack card checkout.
- Customer service fee: 4% of fare, minimum R3.
- Saved cards are tokenised by Paystack; ReaGae does not store full card numbers or CVV.
- Booking receipts/statuses and in-app notifications.
- Accepted riders can open a live tracking link once the driver starts sharing.
- Safety reporting from the authenticated app and from a private tracking link.

### Driver experience
- Driver posts the journey and specifies available seats.
- Requested seats are atomically deducted when accepted.
- When available seats reach zero the ride changes to `FULL` automatically and notifications are sent to the driver and accepted riders. The scheduled departure date/time remains unchanged.
- Driver can start and complete a ride.
- Driver browser location is sent to the server while the ride is active/posted, enabling live tracking.
- Driver can generate a private tracking link and copy it to trusted relatives/contacts.
- Driver cannot publish rides while suspended or while required compliance documents are incomplete.

### Driver compliance / operations
Before ride publishing, the driver must have approved:
1. Vehicle registration.
2. Vehicle compliance / roadworthy evidence.
3. Police clearance.

Agents can:
- View all drivers.
- Filter by active/blocked account and document state.
- View uploaded documents.
- Approve/reject documents.
- Block/unblock driver accounts.
- Review safety reports.

### Back office
Admins have a separate command centre and can add/suspend/activate agents. Staff routes are role protected on the server/API.

### Live safety tracking
- Driver generates a private expiring tracking token.
- Trusted contacts open `/track/<token>` without an account.
- The map refreshes every 5 seconds and uses browser GPS updates from the driver.
- Public contacts can submit a safety report directly from the tracking page.
- The public tracking page intentionally exposes only the live vehicle position, not account credentials or payment data.

## Payments

The implementation uses **Paystack** for South African card processing and tokenised saved-card authorisations. Current published South African pricing lists local transactions at 2.9% + R1 excluding VAT, with no upfront/monthly fees; exact merchant pricing and eligibility can vary. urlPaystack South Africa pricinghttps://paystack.com/za/pricing

The ReaGae platform fee model is deliberately modest:
- Customer service fee: 4% (minimum R3).
- Driver platform fee: 3%.

This gives ReaGae a gross platform margin before gateway/operating costs while keeping the visible customer fee small. For example, on a R100 fare the rider pays R104 and the recorded driver platform fee is R3.

## Environment

Copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL=postgresql://...
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_CALLBACK_URL=http://localhost:3000/rider/payments/callback
CUSTOMER_SERVICE_FEE_RATE=0.04
DRIVER_PLATFORM_FEE_RATE=0.03
```

Use Paystack test credentials during development. Do not commit secrets.

## Database update

For an existing database, run the supplied enterprise migration:

```bash
psql "$DATABASE_URL" -f drizzle/0002_reagae_enterprise.sql
```

Or regenerate/push the Drizzle schema in a controlled development database:

```bash
npm install
npm run db:push
```

## Create the first administrator

After the base schema and enterprise migration exist:

```bash
npm run admin:create -- Admin ReaGae admin@example.com +27000000000 "change-this-password"
```

Use a strong password and replace the example details.

## Run

```bash
npm install
cp .env.example .env.local
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

## Production notes

This package is an application implementation, not a substitute for production merchant, legal, safety or identity-verification onboarding. Before launch:
- Connect Paystack production credentials and complete merchant onboarding.
- Use HTTPS because browser geolocation requires a secure context in production.
- Move driver document binary storage from database data URLs to private object storage (S3-compatible storage) with signed URLs.
- Add webhook signature verification and payment reconciliation before treating a payment as final in a production financial ledger.
- Add a proper identity/background-check provider for real verification.
- Add rate limiting, audit logs, abuse detection, CSRF/origin controls where appropriate, backup/restore and observability.
- For high traffic, replace five-second polling with WebSockets/SSE and a location service.

## Design

The existing ReaGae visual language is retained: responsive MUI surfaces, indigo/violet accents, mobile navigation, animated interaction and a clean operations-oriented dashboard.


## Admin access
The enterprise back office is restricted to `ADMIN` accounts and the agent workspace is restricted to `AGENT` accounts. Normal riders and drivers are never shown staff navigation, and direct navigation to staff routes is redirected.

Bootstrap admin credentials:
- Username: `rea_gae_admin`
- Password: `rea_gae_2026`

Run `npm run db:migrate` and then `npm run admin:create` with `DATABASE_URL` configured. The admin script is idempotent and will reset the bootstrap admin password if the account already exists. For production, change the bootstrap password immediately after first login.

## Production security and operations
- Staff routes are protected by server-side role layouts as well as client guards.
- Suspended users have their active session invalidated on the next authenticated request.
- Login, password-reset, phone-code and public safety-report endpoints have abuse-rate limits.
- Security response headers are enabled globally; HSTS is enabled in production.
- Paystack webhook signature verification is available at `/api/payments/webhook`.
- `/api/health` can be used by an uptime/load-balancer health check.
- Public ride responses do not expose vehicle registration numbers or rider identities.
- Staff driver listings no longer send raw document payloads to every staff browser.
- For multiple application instances, move the in-memory rate limiter to Redis/Upstash before production launch.
- Store uploaded compliance documents in encrypted object storage rather than database text once a production storage provider is configured.

## LIVE journey + verification updates

### Driver verification is enforced at ride creation
Driver verification is intentionally not a navigation item. Opening **Post a ride** automatically checks the driver's verification state:

- `NOT_STARTED` / `REJECTED`: the guided verification flow opens before ride creation.
- `IN_PROGRESS` / `PENDING_REVIEW`: the driver sees what is still being reviewed and cannot publish.
- `VERIFIED`: the ride composer unlocks.

The guided flow covers ID, driver's licence, vehicle details, vehicle registration, vehicle compliance, police clearance and a phone-based live face/liveness check. Existing uploads are detected and displayed instead of forcing a driver to blindly start again.

### Password reset
`/forgot-password` creates a short-lived, single-use password-reset token and sends the reset link using the configured SMTP service. The link opens `/reset-password?token=...`; successful reset invalidates existing sessions for that account.

Set `APP_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM` for real email delivery.

### Live face verification
Desktop drivers receive a secure 15-minute phone link from the verification flow. The phone page requests live camera access and submits a camera capture to the server. If `BIOMETRIC_PROVIDER_URL` and `BIOMETRIC_PROVIDER_TOKEN` are configured, the server can forward the capture to the selected vetted biometric service. Otherwise the capture remains `PENDING_REVIEW` for an agent; the app never pretends that a browser has verified a face.

### Ride transparency
Driver profile photos are shown on rider ride cards. Vehicle registration/number plate is deliberately withheld until the rider's booking is `ACCEPTED`; the accepted ride then exposes the plate so the rider can match the vehicle before entering.

### After-ride actions
Ratings, safety reports and tips are tied to the completed booking/ride. The rider sees these actions on the completed trip rather than a generic rating form. Tips use an active saved Paystack card and are stored against the exact booking.

### Saved cards
Riders can add and soft-remove saved cards. Removed cards are excluded from payment selection.

### Maps
Driver pickup and destination use place search/current location rather than coordinate fields. The map uses OpenStreetMap/Nominatim for place discovery and OSRM for route geometry. Coordinates are stored internally only because the map/routing services require them; drivers do not enter them.


## Identity verification update — September 2026

This build integrates ReaGae with Veridexa server-side verification.

### Required environment
- `VERIDEXA_API_KEY` — create this in the Veridexa developer dashboard.
- `VERIDEXA_BASE_URL=https://veridexa.io`
- Keep the API key server-side only; never expose it as a `NEXT_PUBLIC_*` variable.

The application uses Veridexa document verification for uploaded identity documents and Veridexa biometric face enrollment/comparison for rider identity confirmation. Veridexa's current biometric documentation states that its liveness endpoint is not enabled until a certified provider is registered, so the app does not falsely label the current Veridexa response as a completed liveness decision.

### Database update
Run:
```bash
npm install
npm run db:push
```
or apply `drizzle/0006_identity_legal_veridexa.sql` through your normal migration process.

### Rider flow
1. Registration requires acceptance of Privacy Policy and Terms & Conditions.
2. Email verification is completed first.
3. Riders are sent directly to first-time identity verification.
4. Rider uploads an ID and sees the exact uploaded filename in the UI.
5. Rider completes the first-time face capture.
6. Agents approve the first-time identity case.
7. Every ride request requires a new face capture tied to that specific ride.
8. That ride-specific check is automatically compared with the verified rider face template and recorded in the agent dashboard. It does not require agent approval.

### Privacy/trust
The registration experience links the Privacy Policy and Terms & Conditions and keeps account creation disabled until consent is given. The footer also explains safety, privacy, verification and controlled disclosure in plain language.

## Camera permissions and mobile testing

Face verification uses the browser MediaDevices API. The app sends a `Permissions-Policy` header that explicitly allows camera access for the ReaGae origin. The face-verification screen requests `navigator.mediaDevices.getUserMedia()` only when the rider selects **Allow camera & continue**, so the browser's native permission prompt can appear.

For desktop and mobile production deployments, serve ReaGae over **HTTPS**. `http://localhost` is treated as a secure context by modern browsers for local development, but an ordinary `http://192.168.x.x:3000` address on a phone is not. If a user has previously blocked camera access, the browser will not allow JavaScript to override that decision; the verification screen therefore provides browser/device-specific steps and a retry action.

The server security header is intentionally configured as `camera=(self), microphone=(self), geolocation=(self)` rather than `camera=()`, which would block `getUserMedia()` before the browser could request permission.
