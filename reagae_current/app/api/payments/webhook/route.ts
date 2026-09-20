import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function validSignature(body: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha512", secret).update(body).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  try {
    const event = JSON.parse(raw);
    if (event?.event === "charge.success" && event?.data?.reference) {
      const payment = await db.payment.findUnique({ where: { reference: String(event.data.reference) } });
      if (payment && payment.status === "PENDING") {
        await db.payment.update({ where: { id: payment.id }, data: { status: "PAID" } });
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
}
