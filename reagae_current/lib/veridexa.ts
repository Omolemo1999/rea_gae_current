import crypto from "node:crypto";

const BASE = process.env.VERIDEXA_BASE_URL || "https://veridexa.io";

function key() {
  return process.env.VERIDEXA_API_KEY || "";
}

function authHeaders(): Record<string, string> {
  const apiKey = key();
  return apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
}

export function veridexaConfigured() {
  return Boolean(key());
}

export async function verifyDocumentWithVeridexa(input: {
  bytes: Buffer;
  fileName: string;
  mimeType: string;
}) {
  if (!veridexaConfigured()) return { configured: false as const };

  const form = new FormData();
  form.append("file", new Blob([input.bytes], { type: input.mimeType }), input.fileName);

  const response = await fetch(`${BASE}/api/s2s/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Veridexa document verification failed (${response.status}) ${detail}`.slice(0, 500));
  }

  const job = await response.json();
  if (!job.jobId) return { configured: true as const, jobId: null, report: null };

  const reportResponse = await fetch(`${BASE}/api/s2s/report/${encodeURIComponent(job.jobId)}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const report = reportResponse.ok ? await reportResponse.json() : null;
  return {
    configured: true as const,
    jobId: String(job.jobId),
    report: report?.productionReport ?? report,
  };
}

export function bytesToBase64(bytes: Buffer) {
  return bytes.toString("base64");
}

export async function enrollFace(bytes: Buffer, mimeType = "image/jpeg") {
  if (!veridexaConfigured()) return { configured: false as const };

  const response = await fetch(`${BASE}/api/v1/biometrics/enroll`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      schemaVersion: "biometric-core.api/v1",
      modality: "face",
      sample: { imageBase64: bytesToBase64(bytes) },
    }),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    throw new Error(body?.error?.reason || `Veridexa face enrollment failed (${response.status})`);
  }
  return { configured: true as const, template: body.result?.template, quality: body.result?.quality, requestId: body.requestId };
}

export async function compareFace(reference: any, bytes: Buffer) {
  if (!veridexaConfigured()) return { configured: false as const };

  const response = await fetch(`${BASE}/api/v1/biometrics/compare`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      schemaVersion: "biometric-core.api/v1",
      modality: "face",
      reference,
      probe: {
        modality: "face",
        version: 1,
        vector: bytesToBase64(bytes),
      },
    }),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    throw new Error(body?.error?.reason || `Veridexa face comparison failed (${response.status})`);
  }
  return { configured: true as const, result: body.result, requestId: body.requestId };
}

export function digest(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
