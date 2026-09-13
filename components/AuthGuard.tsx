"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

export default function AuthGuard({
  children,
  role
}: {
  children: React.ReactNode;
  role?: "RIDER" | "DRIVER" | "AGENT" | "ADMIN" | Array<"RIDER" | "DRIVER" | "AGENT" | "ADMIN">;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(s => s.auth);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.user) {
          router.replace("/login");
          return;
        }
        dispatch(setUser(data.user));
        if (role && (Array.isArray(role) ? !role.includes(data.user.role) : data.user.role !== role)) router.replace("/dashboard");
      })
      .catch(() => router.replace("/login"));
  }, [dispatch, router, role]);

  if (loading || !user || (role && (Array.isArray(role) ? !role.includes(user.role) : user.role !== role))) {
    return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  }
  return <>{children}</>;
}
