import { Chip } from "@mui/material";
import type { BookingStatus } from "@/types/booking";
const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase());
export default function BookingStatusChip({ status }: { status: BookingStatus }) {
  return <Chip size="small" label={pretty(status)} color={
    status === "ACCEPTED" || status === "COMPLETED" ? "success" :
    status === "REJECTED" || status === "CANCELLED" ? "error" : "warning"
  } />;
}
