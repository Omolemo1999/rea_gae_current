const BASE = (process.env.COMPREFACE_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const API_KEY = () => process.env.COMPREFACE_VERIFICATION_API_KEY || "";

export function comprefaceConfigured() {
  return Boolean(API_KEY());
}

function providerError(action: string, response: Response, body: any) {
  const detail = body?.message || body?.error || body?.detail || response.statusText || "Unknown CompreFace error";
  return new Error(`CompreFace ${action} failed (${response.status}): ${String(detail).slice(0, 700)}`);
}

export async function verifyFaces(source: { bytes: Buffer; mimeType: string }, target: { bytes: Buffer; mimeType: string }) {
  if (!comprefaceConfigured()) return { configured: false as const };
  if (!source.bytes.length || !target.bytes.length) throw new Error("Both the live capture and reference ID image are required.");

  const form = new FormData();
  form.append("source_image", new Blob([source.bytes], { type: source.mimeType }), "live-selfie.jpg");
  form.append("target_image", new Blob([target.bytes], { type: target.mimeType }), "identity-document.jpg");

  const url = new URL(`${BASE}/api/v1/verification/verify`);
  url.searchParams.set("limit", "1");
  url.searchParams.set("det_prob_threshold", process.env.COMPREFACE_DET_PROB_THRESHOLD || "0.8");
  url.searchParams.set("status", "true");

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "x-api-key": API_KEY() },
      body: form,
      cache: "no-store",
    });
  } catch {
    throw new Error("CompreFace could not be reached. Make sure the CompreFace Docker service is running.");
  }

  const text = await response.text().catch(() => "");
  let body: any = null;
  try { body = JSON.parse(text); } catch { /* provider may return plain text */ }
  if (!response.ok) throw providerError("face verification", response, body);

  const result = Array.isArray(body?.result) ? body.result[0] : null;
  const matches = Array.isArray(result?.face_matches) ? result.face_matches : [];
  const similarity = matches.length ? Number(matches[0]?.similarity ?? 0) : 0;
  const sourceProbability = Number(result?.source_image_face?.probability ?? 0);
  const targetProbability = matches.length ? Number(matches[0]?.probability ?? 0) : 0;
  const threshold = Number(process.env.COMPREFACE_SIMILARITY_THRESHOLD || "0.75");

  if (!result) {
    throw new Error("CompreFace could not detect a usable face in the submitted images. Please use a clear ID photo and retake the camera capture.");
  }
  if (!matches.length) {
    return { configured: true as const, passed: false, similarity: 0, threshold, sourceProbability, targetProbability, raw: body };
  }

  return { configured: true as const, passed: similarity >= threshold, similarity, threshold, sourceProbability, targetProbability, raw: body };
}
