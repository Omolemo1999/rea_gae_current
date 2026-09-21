"use client";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import LiveMap from "@/components/maps/LiveMap";
import FaceCaptureDialog from "@/components/verification/FaceCaptureDialog";
import IdentityDocumentCapture from "@/components/verification/IdentityDocumentCapture";
import { calculateDistanceKm, calculateRidePrice } from "@/lib/pricing";
import ExperienceBanner from "@/components/experience/ExperienceBanner";

const docs = [
  ["ID", "South African ID / identity document"],
  ["DRIVERS_LICENCE", "Valid driver's licence"],
  ["VEHICLE_REGISTRATION", "Vehicle registration"],
  ["VEHICLE_COMPLIANCE", "Vehicle compliance document"],
  ["POLICE_CLEARANCE", "Police clearance"],
] as const;

type Place = { name: string; latitude: number; longitude: number };
type Suggestion = Place & { label: string };

function LocationPicker({
  label,
  value,
  onChange,
  allowCurrent,
}: {
  label: string;
  value: Place | null;
  onChange: (p: Place) => void;
  allowCurrent?: boolean;
}) {
  const [query, setQuery] = useState(value?.name || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setBusy(true);
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=za&limit=5&q=${encodeURIComponent(query)}`,
          { headers: { "Accept-Language": "en" } },
        );
        const d = await r.json();
        setSuggestions(
          d.map((x: any) => ({
            label: x.display_name,
            name: x.display_name,
            latitude: Number(x.lat),
            longitude: Number(x.lon),
          })),
        );
      } finally {
        setBusy(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const current = () =>
    navigator.geolocation?.getCurrentPosition(
      async (p) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.coords.latitude}&lon=${p.coords.longitude}`,
            { headers: { "Accept-Language": "en" } },
          );
          const d = await r.json();
          const name = d.display_name || "Current location";
          setQuery(name);
          onChange({
            name,
            latitude: p.coords.latitude,
            longitude: p.coords.longitude,
          });
        } catch {
          setQuery("Current location");
          onChange({
            name: "Current location",
            latitude: p.coords.latitude,
            longitude: p.coords.longitude,
          });
        }
      },
      () => {},
    );

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        fullWidth
        label={label}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (value) setSuggestions([]);
        }}
        placeholder="Search a place, mall or landmark"
        InputProps={{
          endAdornment: allowCurrent ? (
            <Button size="small" onClick={current} startIcon={<LocationOnRoundedIcon />}>
              Use me
            </Button>
          ) : undefined,
        }}
      />
      {suggestions.length > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            zIndex: 20,
            left: 0,
            right: 0,
            top: "100%",
            mt: 0.5,
            borderRadius: 0,
            overflow: "hidden",
          }}
        >
          {suggestions.map((s) => (
            <Button
              key={`${s.latitude}-${s.longitude}`}
              fullWidth
              sx={{ justifyContent: "flex-start", textAlign: "left", p: 1.5, color: "text.primary" }}
              onClick={() => {
                setQuery(s.label);
                setSuggestions([]);
                onChange(s);
              }}
            >
              {s.label}
            </Button>
          ))}
        </Paper>
      )}
      {busy && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ position: "absolute", right: 10, bottom: -20 }}
        >
          Finding places…
        </Typography>
      )}
    </Box>
  );
}

function UploadStep({
  type,
  label,
  current,
  onDone,
}: {
  type: string;
  label: string;
  current?: any;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    setError("");

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const r = await fetch("/api/driver/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            fileName: file.name,
            mimeType: file.type,
            data: reader.result,
          }),
        });

        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Upload failed.");

        // The parent owns the verification step. Uploading a document must
        // never decide the current step or navigate the verification flow.
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setBusy(false);
      }
    };

    reader.onerror = () => {
      setError("The selected file could not be read.");
      setBusy(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.8,
        borderRadius: 0,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "rgba(49,92,214,.025)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        gap={1.5}
        alignItems={{ sm: "center" }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={800}>{label}</Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", overflowWrap: "anywhere" }}
          >
            {current?.fileName || "No file uploaded yet"}
          </Typography>
          {current?.status && (
            <Typography
              variant="caption"
              color={current.status === "APPROVED" ? "success.main" : "text.secondary"}
            >
              Status:{" "}
              {current.status
                .replaceAll("_", " ")
                .replace(/\b\w/g, (x: string) => x.toUpperCase())}
            </Typography>
          )}
        </Box>

        <Button
          component="label"
          variant="outlined"
          startIcon={busy ? <CircularProgress size={17} /> : <ArrowForwardRoundedIcon />}
          disabled={busy}
        >
          {busy ? "Uploading securely…" : current ? "Replace file" : `Upload ${label}`}
          <input
            hidden
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              // Allow selecting the same file again after a failed/replaced upload.
              e.currentTarget.value = "";
            }}
          />
        </Button>
      </Stack>

      {error && (
        <Typography color="error" variant="caption" sx={{ display: "block", mt: 1 }}>
          {error}
        </Typography>
      )}
    </Paper>
  );
}

function DriverIdCaptureStep({ current, onDone }: { current?: any; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  return <>
    <Paper elevation={0} sx={{ p: 1.8, borderRadius: 0, border: "1px solid", borderColor: "divider", bgcolor: "rgba(49,92,214,.025)" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5} alignItems={{ sm: "center" }}>
        <Box sx={{ minWidth: 0 }}><Typography fontWeight={800}>South African ID / identity document</Typography><Typography variant="caption" color="text.secondary">{current ? `Captured image: ${current.fileName}` : "Capture the front of the physical ID with your camera. PDF uploads are not accepted."}</Typography>{current?.status && <Typography variant="caption" color={current.status === "APPROVED" ? "success.main" : "text.secondary"} sx={{ display: "block" }}>Status: {current.status.replaceAll("_", " ")}</Typography>}</Box>
        <Button variant="outlined" startIcon={<CameraAltRoundedIcon />} onClick={() => setOpen(true)}>{current ? "Retake ID" : "Capture ID"}</Button>
      </Stack>
    </Paper>
    <IdentityDocumentCapture open={open} onClose={() => setOpen(false)} submitUrl="/api/driver/documents" type="ID" onCaptured={(result) => { setOpen(false); onDone(); }} />
  </>;
}

function VerificationGate() {
  const [state, setState] = useState<any>(null);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [faceOpen, setFaceOpen] = useState(false);

  const [identity, setIdentity] = useState({
    licenceNumber: "",
    licenceExpiry: "",
  });

  const [vehicle, setVehicle] = useState({
    registrationNumber: "",
    make: "",
    model: "",
    year: "",
    colour: "",
    seats: "4",
    luggageCapacity: "2",
  });

  /*
   * Work out the furthest completed step from persisted verification data.
   *
   * IMPORTANT:
   * Do not blindly set step = 1 whenever the API is refreshed. Uploads and
   * vehicle saves call this loader, so doing that was the reason the UI jumped
   * back to "Step 1 of 4".
   */
  const getPersistedStep = (d: any) => {
    const p = d?.profile;
    const documents = d?.documents || [];
    const has = (type: string) => documents.some((doc: any) => doc.type === type);
    const hasIdentityDocs = has("ID") && has("DRIVERS_LICENCE");
    const hasVehicleDocs =
      has("VEHICLE_REGISTRATION") &&
      has("VEHICLE_COMPLIANCE") &&
      has("POLICE_CLEARANCE");
    const hasVehicle = Boolean(d?.vehicles?.length);
    const faceComplete =
      p?.faceVerificationStatus === "PENDING_REVIEW" ||
      p?.faceVerificationStatus === "VERIFIED";

    if (faceComplete) return 4;
    if (hasIdentityDocs && p?.identityVerificationStatus === "PENDING_REVIEW") {
      if (hasVehicleDocs && hasVehicle) return 3;
      return 2;
    }
    return 1;
  };

  const load = async (options: { updateStep?: boolean } = {}) => {
    const r = await fetch("/api/verification/driver", { cache: "no-store" });
    const d = await r.json();

    if (!r.ok) {
      setError(d.error || "Could not load driver verification.");
      return;
    }

    setState(d);

    const p = d.profile;
    if (p) {
      setIdentity({
        licenceNumber: p.licenceNumber || "",
        licenceExpiry: p.licenceExpiry
          ? new Date(p.licenceExpiry).toISOString().slice(0, 10)
          : "",
      });

      if (p.verificationStatus === "IN_PROGRESS" || p.verificationStatus === "REJECTED") {
        setStarted(true);
      }
    }

    if (d.vehicles?.[0]) {
      const v = d.vehicles[0];
      setVehicle({
        registrationNumber: v.registrationNumber || "",
        make: v.make || "",
        model: v.model || "",
        year: String(v.year || ""),
        colour: v.colour || "",
        seats: String(v.seats || "4"),
        luggageCapacity: String(v.luggageCapacity || "2"),
      });
    }

    if (options.updateStep) {
      setStep(getPersistedStep(d));
    }
  };

  useEffect(() => {
    void load({ updateStep: true });
  }, []);

  const docsMap = useMemo(() => {
    const m: any = {};
    (state?.documents || []).forEach((d: any) => {
      if (!m[d.type]) m[d.type] = d;
    });
    return m;
  }, [state]);

  const pretty = (v: any) =>
    v
      ? v.replaceAll("_", " ").replace(/\b\w/g, (x: string) => x.toUpperCase())
      : "Not Started";

  const status = state?.profile?.verificationStatus || "NOT_STARTED";

  if (status === "PENDING_REVIEW") {
    return (
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: { xs: 2.5, md: 4 },
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(135deg,rgba(91,108,255,.08),rgba(255,255,255,.92))",
        }}
      >
        <Chip color="warning" label="Verification under review" />
        <Typography variant="h4" sx={{ mt: 2 }}>
          You're nearly there.
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Your documents and live face check are with our verification team. You cannot
          publish a ride until an agent approves the complete verification.
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 3 }}>
          {docs.map(([t]) => (
            <Chip
              key={t}
              icon={docsMap[t]?.status === "APPROVED" ? <CheckCircleRoundedIcon /> : undefined}
              label={pretty(docsMap[t]?.status || "Missing")}
            />
          ))}
          <Chip label={state?.profile?.faceVerificationStatus || "Face check pending"} />
        </Stack>
      </Paper>
    );
  }

  if (status === "VERIFIED") return null;

  if (status === "REJECTED" && !started) {
    setMessage("A previous submission needs attention. You can safely resubmit the required steps below.");
  }

  const start = async () => {
    setError("");
    const r = await fetch("/api/verification/driver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    });
    const d = await r.json();

    if (!r.ok) {
      setError(d.error || "Could not start verification.");
      return;
    }

    setStarted(true);
    setStep(1);
    setState(d);
  };

  const saveIdentity = async () => {
    setError("");

    if (!docsMap.ID || !docsMap.DRIVERS_LICENCE) {
      setError("Upload both your ID and driver licence before continuing.");
      return;
    }

    const r = await fetch("/api/verification/driver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "identity", ...identity }),
    });
    const d = await r.json();

    if (!r.ok) {
      setError(d.error || "Identity details could not be saved.");
      return;
    }

    setState(d);
    // Explicitly advance. The subsequent load cannot pull us back to step 1.
    setStep(2);
  };

  const saveVehicle = async () => {
    setError("");

    if (
      !docsMap.VEHICLE_REGISTRATION ||
      !docsMap.VEHICLE_COMPLIANCE ||
      !docsMap.POLICE_CLEARANCE
    ) {
      setError("Upload all three vehicle and compliance documents before continuing.");
      return;
    }

    const r = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicle),
    });
    const d = await r.json();

    if (!r.ok) {
      setError(d.error || "Vehicle details could not be saved.");
      return;
    }

    setStep(3);
    // Refresh data only; never reset the current step.
    await load({ updateStep: false });
  };

  const startFace = () => {
    setError("");
    setFaceOpen(true);
  };

  const handleFaceComplete = async (result: any) => {
    setFaceOpen(false);
    setError("");
    setMessage(result?.message || "Live face verification completed.");
    setStep(4);
    // Face completion is persisted server-side. Refresh without deriving a
    // different step from stale/in-flight state.
    await load({ updateStep: false });
  };

  const submit = async () => {
    setError("");

    const r = await fetch("/api/verification/driver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit" }),
    });
    const d = await r.json();

    if (!r.ok) {
      setError(d.error || "Could not submit verification.");
      return;
    }

    setState(d);
    setMessage(d.message);
    await load({ updateStep: false });
  };

  if (!started) {
    return (
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: { xs: 2.5, md: 4 },
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
          <Box>
            <Chip label="Driver verification" color="primary" />
            <Typography variant="h3" sx={{ mt: 1.5 }}>
              Let's get you road-ready.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
              Before you publish your first ride, ReaGae needs to verify who you are, your
              live face, your vehicle and the required compliance documents. It is one
              guided process — once a step is completed, the next one opens automatically.
            </Typography>
          </Box>
          <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main" }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 40 }} />
          </Avatar>
        </Stack>

        <Grid container spacing={1.5} sx={{ mt: 3 }}>
          {docs.map(([t, l], i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={t}>
              <Paper
                elevation={0}
                sx={{ p: 2, bgcolor: "rgba(91,108,255,.06)", borderRadius: 0 }}
              >
                <Typography fontWeight={850}>
                  {i + 1}. {l}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Required before approval
                </Typography>
              </Paper>
            </Grid>
          ))}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              elevation={0}
              sx={{ p: 2, bgcolor: "rgba(91,108,255,.06)", borderRadius: 0 }}
            >
              <Typography fontWeight={850}>6. Live face + liveness</Typography>
              <Typography variant="caption" color="text.secondary">
                Camera verification
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {message && (
          <Alert sx={{ mt: 3 }} severity="info">
            {message}
          </Alert>
        )}
        {error && (
          <Alert sx={{ mt: 2 }} severity="error">
            {error}
          </Alert>
        )}

        <Button size="large" variant="contained" sx={{ mt: 3 }} onClick={start}>
          Start verification
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: { xs: 2.5, md: 4 },
          borderRadius: 0,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="overline" color="primary" fontWeight={900}>
          Step {step} of 4
        </Typography>

        <Typography variant="h4" sx={{ mt: 0.5 }}>
          {step === 1
            ? "Confirm your identity"
            : step === 2
              ? "Add your vehicle"
              : step === 3
                ? "Complete your live face check"
                : "Send everything for review"}
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {step === 1
            ? "Capture your ID with the camera, upload your driver licence, and enter your licence details."
            : step === 2
              ? "Your vehicle information and vehicle documents are checked together."
              : step === 3
                ? "Allow camera access, position your face inside the guide and complete the live check."
                : "We check every required item before an agent can approve you."}
        </Typography>

        {error && (
          <Alert sx={{ mt: 2 }} severity="error">
            {error}
          </Alert>
        )}

        {message && step === 4 && (
          <Alert sx={{ mt: 2 }} severity="success">
            {message}
          </Alert>
        )}

        {step === 1 && (
          <Stack gap={2.2} sx={{ mt: 3 }}>
            <DriverIdCaptureStep current={docsMap.ID} onDone={() => void load({ updateStep: false })} />
            <UploadStep
              type="DRIVERS_LICENCE"
              label="driver's licence"
              current={docsMap.DRIVERS_LICENCE}
              onDone={() => void load({ updateStep: false })}
            />

            <Divider />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Licence number"
                  value={identity.licenceNumber}
                  onChange={(e) =>
                    setIdentity({ ...identity, licenceNumber: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Licence expiry"
                  InputLabelProps={{ shrink: true }}
                  value={identity.licenceExpiry}
                  onChange={(e) =>
                    setIdentity({ ...identity, licenceExpiry: e.target.value })
                  }
                />
              </Grid>
            </Grid>

            <Button variant="contained" size="large" onClick={saveIdentity}>
              Continue to vehicle <ArrowForwardRoundedIcon />
            </Button>
          </Stack>
        )}

        {step === 2 && (
          <Stack gap={2} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              {Object.entries(vehicle).map(([k, v]) => (
                <Grid size={{ xs: 12, sm: 6 }} key={k}>
                  <TextField
                    fullWidth
                    type={["year", "seats", "luggageCapacity"].includes(k) ? "number" : "text"}
                    label={k.replace(/([A-Z])/g, " $1")}
                    value={v}
                    onChange={(e) => setVehicle({ ...vehicle, [k]: e.target.value })}
                  />
                </Grid>
              ))}
            </Grid>

            <UploadStep
              type="VEHICLE_REGISTRATION"
              label="vehicle registration"
              current={docsMap.VEHICLE_REGISTRATION}
              onDone={() => void load({ updateStep: false })}
            />
            <UploadStep
              type="VEHICLE_COMPLIANCE"
              label="vehicle compliance document"
              current={docsMap.VEHICLE_COMPLIANCE}
              onDone={() => void load({ updateStep: false })}
            />
            <UploadStep
              type="POLICE_CLEARANCE"
              label="police clearance"
              current={docsMap.POLICE_CLEARANCE}
              onDone={() => void load({ updateStep: false })}
            />

            <Button variant="contained" size="large" onClick={saveVehicle}>
              Continue to live check <ArrowForwardRoundedIcon />
            </Button>
          </Stack>
        )}

        {step === 3 && (
          <Stack gap={2.5} sx={{ mt: 3 }}>
            <Alert severity="info">
              Your camera opens directly in ReaGae. Allow camera access when your browser
              asks, then position your face inside the guide.
            </Alert>
            <Button
              variant="contained"
              size="large"
              startIcon={<CameraAltRoundedIcon />}
              onClick={startFace}
            >
              Open camera & start live check
            </Button>
          </Stack>
        )}

        {step === 4 && (
          <Stack gap={2.5} sx={{ mt: 3 }}>
            <Alert severity="success">
              Your live face check is complete. Everything is ready for submission.
            </Alert>
            <Typography color="text.secondary">
              Submit the completed verification so the ReaGae verification team can review
              your documents, vehicle information and live face check.
            </Typography>
            <Button variant="contained" size="large" onClick={submit}>
              Submit verification for review
            </Button>
          </Stack>
        )}
      </Paper>

      <FaceCaptureDialog
        open={faceOpen}
        mode="INITIAL"
        onClose={() => setFaceOpen(false)}
        onComplete={handleFaceComplete}
      />
    </>
  );
}

export default function CreateRide() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    pickup: null as Place | null,
    destination: null as Place | null,
    departureDate: "",
    departureTime: "",
    totalSeats: "3",
    luggageCapacity: "2",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/drivers/me")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile));
  }, []);

  const verified = profile?.verificationStatus === "VERIFIED";

  const distance = useMemo(
    () =>
      form.pickup && form.destination
        ? calculateDistanceKm(form.pickup, form.destination)
        : 0,
    [form.pickup, form.destination],
  );

  const price = calculateRidePrice({
    distanceKm: distance,
    seats: +form.totalSeats || 1,
    luggageBags: +form.luggageCapacity || 0,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    if (!form.pickup || !form.destination) {
      setError("Choose a pickup and destination from the place suggestions.");
      setBusy(false);
      return;
    }

    const r = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup: form.pickup,
        destination: form.destination,
        departureDate: form.departureDate,
        departureTime: form.departureTime,
        totalSeats: +form.totalSeats,
        luggageCapacity: +form.luggageCapacity,
      }),
    });

    const d = await r.json();
    setBusy(false);

    if (!r.ok) {
      setError(d.error || "Could not create ride.");
      return;
    }

    router.replace(`/driver/rides/${d.ride.id}`);
  };

  return (
    <AuthGuard role="DRIVER">
      <DashboardShell role="DRIVER">
        <Typography variant="h3">Post a ride</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Set your route. We'll handle the distance, route and passenger price.
        </Typography>

        <ExperienceBanner
          audience="DRIVER"
          slot="DRIVER_POST_RIDE_BANNER"
          compact
        />

        {!verified && <VerificationGate />}

        {verified && (
          <Paper
            component="form"
            onSubmit={submit}
            elevation={0}
            sx={{
              mt: 3,
              p: { xs: 2, md: 4 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 0,
            }}
          >
            <Grid container spacing={2.2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <LocationPicker
                  label="Pickup"
                  value={form.pickup}
                  onChange={(p) => setForm((f) => ({ ...f, pickup: p }))}
                  allowCurrent
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <LocationPicker
                  label="Destination"
                  value={form.destination}
                  onChange={(p) => setForm((f) => ({ ...f, destination: p }))}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                {form.pickup && form.destination ? (
                  <LiveMap pickup={form.pickup} destination={form.destination} height={390} />
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      height: 220,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 0,
                      bgcolor: "#EEF2F8",
                    }}
                  >
                    <Typography color="text.secondary">
                      Choose your pickup and destination to preview the route.
                    </Typography>
                  </Paper>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Departure date"
                  InputLabelProps={{ shrink: true }}
                  value={form.departureDate}
                  onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="Departure time"
                  InputLabelProps={{ shrink: true }}
                  value={form.departureTime}
                  onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Seats available"
                  inputProps={{ min: 1, max: 8 }}
                  value={form.totalSeats}
                  onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Luggage capacity"
                  inputProps={{ min: 0, max: 10 }}
                  value={form.luggageCapacity}
                  onChange={(e) => setForm({ ...form, luggageCapacity: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 0,
                    background:
                      "linear-gradient(135deg,rgba(91,108,255,.10),rgba(121,89,233,.07))",
                  }}
                >
                  <Typography color="text.secondary">Estimated journey</Typography>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    gap={2}
                    sx={{ mt: 1 }}
                  >
                    <Box>
                      <Typography variant="h5">
                        {distance ? `${distance} km` : "Choose your route"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Affordable system-calculated passenger price
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="primary">
                      R{price}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {error && (
              <Alert sx={{ mt: 2 }} severity="error">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={busy || !form.pickup || !form.destination}
              sx={{ mt: 3 }}
            >
              {busy ? "Publishing your ride…" : "Publish ride"}
            </Button>
          </Paper>
        )}
      </DashboardShell>
    </AuthGuard>
  );
}
