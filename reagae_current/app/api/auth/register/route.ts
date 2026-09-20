import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, hashToken, randomToken } from "@/lib/security";
import { sendVerificationEmail } from "@/lib/email";
import { strongPassword, validEmail } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");
    const role = body.role;
    const legalAccepted = body.legalAccepted === true;
    const LEGAL_VERSION = "2026-09-20";

    if (!firstName || !lastName || !phone || !["RIDER", "DRIVER"].includes(role)) {
      return NextResponse.json({ error: "All required fields must be supplied." }, { status: 400 });
    }
    if (!legalAccepted) return NextResponse.json({ error: "You must accept the Privacy Policy and Terms & Conditions to create a ReaGae account." }, { status: 400 });

    const emailError = validEmail(email);
    if (emailError) return NextResponse.json({ error: emailError }, { status: 400 });
    const passError = strongPassword(password);
    if (passError) return NextResponse.json({ error: passError }, { status: 400 });

    const existing = await db.user.findFirst({ where: { OR: [{ email }, { phone }] }, select: { email: true, phone: true } });
    if (existing?.email === email) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    if (existing?.phone === phone) return NextResponse.json({ error: "An account with that phone number already exists." }, { status: 409 });

    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        passwordHash: hashPassword(password),
        role,
        legalAcceptedAt: new Date(),
        legalVersion: LEGAL_VERSION,
        driverProfile: role === "DRIVER" ? { create: {} } : undefined,
        riderProfile: role === "RIDER" ? { create: {} } : undefined,
      },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, accountStatus: true, emailVerified: true, phoneVerified: true, ratingAverage: true, ratingCount: true, createdAt: true },
    });

    const token = randomToken();
    await db.emailVerificationToken.deleteMany({ where: { userId: user.id } });
    await db.emailVerificationToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    await sendVerificationEmail(user.email, user.firstName, token);

    return NextResponse.json({ user, message: "Account created. Check your email to verify your account." }, { status: 201 });
  } catch (error) {
    console.error("register", error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
