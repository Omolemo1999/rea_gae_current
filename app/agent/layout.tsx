import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!(["AGENT", "ADMIN"] as string[]).includes(user.role)) redirect("/dashboard");
  return children;
}
