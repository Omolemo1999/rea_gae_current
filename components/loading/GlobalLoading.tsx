"use client";

import { useEffect, useRef, useState } from "react";
import CarLoader from "./CarLoader";

/** Shows the ReaGae loading animation for application network activity. */
export default function GlobalLoading() {
  const [visible, setVisible] = useState(false);
  const pending = useRef(0);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    let disposed = false;

    const clear = () => {
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      showTimer.current = null;
      hideTimer.current = null;
    };

    const begin = () => {
      pending.current += 1;
      if (pending.current !== 1 || disposed) return;
      showTimer.current = window.setTimeout(() => setVisible(true), 120);
    };

    const end = () => {
      pending.current = Math.max(0, pending.current - 1);
      if (pending.current !== 0 || disposed) return;
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      showTimer.current = null;
      // Keep the animation visible long enough to be perceived instead of flashing.
      hideTimer.current = window.setTimeout(() => setVisible(false), 360);
    };

    window.fetch = (async (...args: Parameters<typeof window.fetch>) => {
      begin();
      try {
        return await originalFetch(...args);
      } finally {
        end();
      }
    }) as typeof window.fetch;

    return () => {
      disposed = true;
      clear();
      window.fetch = originalFetch;
    };
  }, []);

  if (!visible) return null;
  return (
    <div className="reagae-global-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="reagae-global-loader__inner">
        <CarLoader label="Loading…" />
      </div>
    </div>
  );
}
