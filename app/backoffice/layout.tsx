import { requireRole } from "@/lib/auth";

export default async function BackOfficeLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  return children;
}
