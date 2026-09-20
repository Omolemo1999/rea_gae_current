"use client";
import { Button, ButtonProps, CircularProgress } from "@mui/material";

export default function LoadingButton({ loading, children, startIcon, ...props }: ButtonProps & { loading?: boolean }) {
  return (
    <Button {...props} disabled={loading || props.disabled} startIcon={loading ? undefined : startIcon}>
      {loading ? <><CircularProgress size={18} thickness={4} color="inherit" sx={{ mr: 1 }} />{children}</> : children}
    </Button>
  );
}
