# Camera ID + CompreFace fix

- Government ID is now captured through the browser camera as an image. ID PDF uploads are rejected for both riders and drivers.
- The camera preview uses a post-render `srcObject` attachment. This fixes the race where `getUserMedia()` succeeded but React had not mounted the `<video>` element yet, leaving a dark preview.
- Rider ID capture uses the rear/environment camera where available and displays a card guide.
- Driver identity capture uses the same camera flow; other driver compliance documents can still be uploaded normally.
- During face verification, the live face image and the stored camera-captured ID image are submitted together to CompreFace verification. The face match result is stored against the verification case/profile.
- Existing PDF IDs will not be used for biometric matching; the user must recapture the physical ID.

## CompreFace
Set the existing server variables: `COMPREFACE_BASE_URL`, `COMPREFACE_VERIFICATION_API_KEY`, and optionally `COMPREFACE_SIMILARITY_THRESHOLD` / `COMPREFACE_DET_PROB_THRESHOLD`. The verification API must be reachable from the Next.js server.

## Browser camera
Production must be served over HTTPS. `http://localhost` remains supported for local development.
