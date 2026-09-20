"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CarLoader from "./CarLoader";

export default function RouteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 420);
    return () => window.clearTimeout(id);
  }, [pathname]);

  if (!visible) return null;
  return (
    <div className="reagae-route-loader" role="status" aria-live="polite" aria-label="Loading page">
      <CarLoader fullScreen label="Loading ReaGae…" />
    </div>
  );
}
