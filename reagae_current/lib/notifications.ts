import { db } from "@/lib/db";

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type: string;
}) {
  return db.notification.create({ data: input });
}

export async function createNotifications(inputs: Array<{
  userId: string;
  title: string;
  message: string;
  type: string;
}>) {
  if (!inputs.length) return;
  return db.notification.createMany({ data: inputs });
}
