import type { Metadata } from "next";
import ThemeRegistry from "@/components/common/ThemeRegistry";
import RouteLoader from "@/components/loading/RouteLoader";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReaGae",
  description: "Long distance. Better together.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><ThemeRegistry><RouteLoader /><Providers>{children}</Providers></ThemeRegistry></body></html>;
}
