# ReaGae + CompreFace face verification

ReaGae now uses self-hosted CompreFace for 1:1 face verification. The browser camera sends a live selfie to ReaGae; ReaGae sends that selfie and the user's ID image to CompreFace's verification endpoint.

## 1. Start ReaGae PostgreSQL

```bash
docker compose up -d postgres
```

## 2. Start CompreFace

```bash
docker compose --profile face up -d compreface
```

CompreFace is exposed at `http://localhost:8000` by this project. The first startup can take time; wait for the service to finish starting before creating the face service.

## 3. Create the verification service

Open `http://localhost:8000/login`, create/sign into a CompreFace account, create an application, then create a **VERIFICATION** face service. Copy the API key generated for that service. CompreFace requires a service-specific API key and its verification service compares two supplied images. See the official docs: https://github.com/exadel-inc/CompreFace/blob/master/docs/Face-services-and-plugins.md

## 4. Configure ReaGae

Copy `.env.example` to `.env` and set:

```env
COMPREFACE_BASE_URL=http://localhost:8000
COMPREFACE_VERIFICATION_API_KEY=YOUR_VERIFICATION_SERVICE_API_KEY
COMPREFACE_DET_PROB_THRESHOLD=0.8
COMPREFACE_SIMILARITY_THRESHOLD=0.75
```

Do not expose the API key through a `NEXT_PUBLIC_*` variable.

## 5. Important document requirement

Automatic face matching needs a face image from the identity document. Upload the ID as JPG, PNG, or WebP for automatic matching. PDFs are still accepted by the document upload flow for manual review, but the automatic face-match endpoint cannot send a PDF to CompreFace because CompreFace's image verification endpoint accepts image files.

## 6. Test

1. Start ReaGae.
2. Log in as a driver/rider.
3. Upload a clear ID image containing one face.
4. Open the camera check.
5. Allow camera access.
6. Capture a clear frontal selfie.
7. ReaGae calls `/api/v1/verification/verify` with `source_image` = live selfie and `target_image` = ID image.
8. A similarity score is returned. The configured threshold defaults to `0.75` and can be adjusted using `COMPREFACE_SIMILARITY_THRESHOLD`.

The implementation does not claim liveness detection. Camera capture is a face-match step; liveness should be added separately if it is required for the production risk model.
