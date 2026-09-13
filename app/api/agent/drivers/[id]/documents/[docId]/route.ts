import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
export async function GET(_:Request,{params}:{params:Promise<{id:string;docId:string}>}){
 const u=await getCurrentUser();const {id,docId}=await params;
 if(!u||!['AGENT','ADMIN'].includes(u.role))return NextResponse.json({error:'Forbidden'},{status:403});
 const doc=await db.driverDocument.findUnique({where:{id:docId}});
 if(!doc||doc.driverId!==id)return NextResponse.json({error:'Document not found'},{status:404});
 const match=String(doc.data).match(/^data:([^;]+);base64,(.+)$/s);
 if(!match)return NextResponse.json({error:'Document format unavailable'},{status:415});
 return new NextResponse(Buffer.from(match[2],'base64'),{headers:{'Content-Type':doc.mimeType,'Content-Disposition':`inline; filename="${doc.fileName.replace(/"/g,'')}"`}});
}
