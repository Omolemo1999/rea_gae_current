import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ notifications, unreadCount: notifications.filter((n) => !n.readAt).length });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.all) {
    await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  } else if (body.id) {
    await db.notification.updateMany({ where: { id: String(body.id), userId: user.id }, data: { readAt: new Date() } });
  } else {
    return NextResponse.json({ error: "Notification id or all=true is required." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
