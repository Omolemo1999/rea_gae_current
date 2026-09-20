# ReaGae Camera + Enterprise Design Update

## Camera permission fix

The previous middleware sent `Permissions-Policy: camera=()`, which explicitly disabled camera access for the page. It is now `camera=(self)` so the browser can request camera permission for ReaGae.

The face verification flow now:

1. Creates the server-side verification session.
2. Checks whether the browser exposes camera access.
3. Checks secure-context requirements.
4. Requests `navigator.mediaDevices.getUserMedia()` from an explicit **Allow camera & continue** action.
5. Supports front-facing cameras on desktop and mobile using `facingMode: { ideal: "user" }`.
6. Detects common permission/device/busy-camera errors.
7. Explains how to restore camera access after a user previously blocked it.
8. Stops camera tracks when the flow closes or completes.
9. Shows a loading animation while the browser permission request is pending.

## Design system

The rider verification experience is now the visual foundation for authentication and dashboards:

- indigo/purple asymmetric visual panels
- Plus Jakarta Sans + Manrope typography
- structured square surfaces
- no rounded card containers
- icon-led actions and navigation
- stronger whitespace and hierarchy
- rectangular operational dashboard navigation inspired by modern mobility products
- responsive mobile-first layouts

## Loading states

The app uses the existing MUI loading-button system and ReaGae car loader for verification, route transitions and rider data loading. Face permission requests display an animated camera state, and data-heavy rider pages now show the car loader while requests are being retrieved.
