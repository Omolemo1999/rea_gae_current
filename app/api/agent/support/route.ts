import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { getCurrentUser } from "@/lib/auth";
export async function GET(){const u=await getCurrentUser();if(!u||!['AGENT','ADMIN'].includes(u.role))return NextResponse.json({error:'Forbidden.'},{status:403});const requests=await db.supportRequest.findMany({orderBy:{createdAt:'asc'}});return NextResponse.json({requests});}
