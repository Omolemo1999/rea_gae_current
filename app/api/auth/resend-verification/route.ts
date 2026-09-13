import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, randomToken } from "@/lib/security";
import { sendVerificationEmail } from "@/lib/email";
import { validEmail } from "@/lib/validation";

export async function POST(req: Request) {
  const { email } = await req.json(); const normalized=String(email||"").trim().toLowerCase();
  if (validEmail(normalized)) return NextResponse.json({message:"If an account exists, a verification email will be sent."});
  const user=await db.user.findUnique({where:{email:normalized}});
  if (user && !user.emailVerified) {
    const token=randomToken(); await db.emailVerificationToken.deleteMany({where:{userId:user.id}});
    await db.emailVerificationToken.create({data:{userId:user.id,tokenHash:hashToken(token),expiresAt:new Date(Date.now()+24*60*60*1000)}});
    await sendVerificationEmail(user.email,user.firstName,token);
  }
  return NextResponse.json({message:"If an account exists, a verification email will be sent."});
}
