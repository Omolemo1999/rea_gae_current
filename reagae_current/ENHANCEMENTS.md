# ReaGae — UX / Safety Enhancement Pass

## Design direction
The authentication experience now uses an asymmetrical editorial layout inspired by the supplied reference: a large white form area paired with a purple/indigo visual panel, layered organic geometry, strong typography and restrained iconography. It is an original implementation rather than a copy of the reference artwork.

Dashboards use a clean operations-first structure influenced by modern mobility dashboards: compact left navigation, clear workspace context, high information density, restrained borders, strong black/white hierarchy and a blue action accent.

## Loading system
- Global route progress bar.
- Animated ReaGae car loader for page/workspace loading.
- MUI CircularProgress for compact states.
- LoadingButton wrapper for async actions.
- Camera verification loading states.
- Skeletons remain available for data-heavy operational screens.
- Reduced-motion support is included.

MUI's progress components are used for indeterminate and determinate states, and MUI supports loading indicators directly in buttons. See the official MUI progress and Button APIs for implementation guidance.

## Rider verification
1. Rider registration requires legal consent.
2. Email verification follows registration.
3. The rider is required to complete first-time ID + face verification.
4. The verification page is a single guided flow rather than repeatedly navigating between screens.
5. Uploaded ID filenames are displayed immediately.
6. First-time face verification is submitted to the existing Veridexa integration and enters agent review.
7. Once the rider is verified, the rider may access normal rider workspace functions.
8. Every ride request requires a fresh ride-specific face check.
9. Ride-specific face checks are recorded against rider + ride and do not require agent approval.
10. The agent rider desk displays the ride-specific verification audit trail.
11. A blocking verification dialog appears over rider workspace pages until first-time verification is complete.

## Privacy / trust
- Privacy and Terms are visible during registration.
- Registration remains disabled until consent is checked.
- Legal version and acceptance timestamp are submitted to the backend.
- Footer communicates safety, privacy, verification and disclosure principles.
- Privacy policy describes limited disclosure for service operation, lawful requirements, serious safety incidents, suspected crime/fraud and other stated purposes.

## Status labels
Internal enum values remain machine-readable, but user-facing status labels are humanized, for example:
- Not Started
- In Progress
- Pending Review
- Verified
- Rejected

## Existing backend preserved
The enhancement pass preserves the existing Drizzle, Next.js, MUI, authentication, payment, ride, support, safety and Veridexa architecture rather than replacing working backend functionality with mock data.
