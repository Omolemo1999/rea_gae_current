"use client";

import { Provider } from "react-redux";
import { useRef } from "react";
import { makeStore, type AppStore } from "@/store";
import GlobalLoading from "@/components/loading/GlobalLoading";

export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();
  return <Provider store={storeRef.current}><GlobalLoading />{children}</Provider>;
}
