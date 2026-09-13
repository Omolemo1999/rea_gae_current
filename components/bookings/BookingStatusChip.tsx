import { Chip } from "@mui/material";
import type { BookingStatus } from "@/types/booking";
export default function BookingStatusChip({ status }: { status: BookingStatus }) {
  return <Chip size="small" label={status.replaceAll("_", " ")} color={
    status === "ACCEPTED" || status === "COMPLETED" ? "success" :
    status === "REJECTED" || status === "CANCELLED" ? "error" : "warning"
  } />;
}
