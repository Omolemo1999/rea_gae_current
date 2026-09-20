# ReaGae face verification architecture

## Provider

ReaGae uses **CompreFace by Exadel** for face verification. It is self-hosted and exposes a REST API through Docker. CompreFace's dedicated verification service accepts `source_image` and `target_image` and returns face-match similarity. This is the endpoint used by ReaGae.

## Verification flow

1. Driver/rider uploads an identity document.
2. For automatic face matching, the identity document must contain a usable face image and should be uploaded as JPG, PNG or WebP.
3. ReaGae opens the browser camera.
4. The browser captures the live selfie.
5. ReaGae sends the selfie and ID image to CompreFace from the server.
6. CompreFace returns the similarity score.
7. ReaGae compares the score against `COMPREFACE_SIMILARITY_THRESHOLD` (default `0.75`).
8. A passing match advances the verification workflow; a failed match leaves the verification incomplete and lets the user retake the capture.

## Security

- The CompreFace API key is server-side only.
- The browser never calls CompreFace directly.
- The live camera image is sent to ReaGae's server and then to the self-hosted CompreFace service.
- The project does not claim that a face match is a liveness test. If production policy requires anti-spoofing/liveness, it must be added as a separate control.
