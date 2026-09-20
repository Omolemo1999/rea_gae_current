"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CarLoader from "@/components/loading/CarLoader";
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
    return <CarLoader fullScreen label="Loading your secure workspace…" />;
  }
  return <>{children}</>;
}
