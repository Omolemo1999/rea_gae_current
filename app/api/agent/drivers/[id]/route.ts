import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

const staff=(u:any)=>u&&(u.role==='AGENT'||u.role==='ADMIN');

async function refreshOverall(id:string){
  const profile=await db.driverProfile.findUnique({where:{userId:id}});
  const docs=await db.driverDocument.findMany({where:{driverId:id}});
  const vehicle=await db.vehicle.findFirst({where:{driverId:id},orderBy:{createdAt:'desc'}});
  const identityDocs=['ID','DRIVERS_LICENCE'].every(t=>docs.some((d:any)=>d.type===t&&d.status==='APPROVED'));
  const vehicleDocs=['VEHICLE_REGISTRATION','VEHICLE_COMPLIANCE'].every(t=>docs.some((d:any)=>d.type===t&&d.status==='APPROVED'));
  const police=docs.some((d:any)=>d.type==='POLICE_CLEARANCE'&&d.status==='APPROVED');
  const face=profile?.faceLivenessResult==='PASSED'&&profile?.faceMatchResult==='PASSED'&&profile.faceVerificationStatus==='VERIFIED';
  const identity=profile?.identityVerificationStatus==='VERIFIED'&&identityDocs;
  if(identity) await db.driverProfile.update({where:{userId:id},data:{identityVerificationStatus:'VERIFIED'}});
  if(police) await db.driverProfile.update({where:{userId:id},data:{backgroundCheckStatus:'VERIFIED'}});
  if(vehicleDocs && vehicle) await db.vehicle.update({where:{id:vehicle.id},data:{verificationStatus:'VERIFIED'}});
  const final=identity && face && police && vehicleDocs && vehicle;
  await db.driverProfile.update({where:{userId:id},data:{verificationStatus:final?'VERIFIED':(profile?.verificationStatus==='REJECTED'?'REJECTED':'PENDING_REVIEW')}});
  return final;
}

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const u=await getCurrentUser();const {id}=await params;if(!staff(u))return NextResponse.json({error:'Forbidden'},{status:403});
  const b=await req.json();
  if(b.accountStatus){const user=await db.user.update({where:{id},data:{accountStatus:b.accountStatus}});return NextResponse.json({user:{id:user.id,accountStatus:user.accountStatus}})}
  if(b.documentId&&['APPROVED','REJECTED'].includes(b.status)){
    const doc=await db.driverDocument.update({where:{id:String(b.documentId)},data:{status:b.status,reviewedBy:u.id,reviewNotes:String(b.notes||'')}});
    if(b.status==='REJECTED') await db.driverProfile.update({where:{userId:id},data:{verificationStatus:'REJECTED', ...(doc.type==='ID'||doc.type==='DRIVERS_LICENCE'?{identityVerificationStatus:'REJECTED'}:{})}});
    const final=await refreshOverall(id);
    if(final) await createNotification({userId:id,title:'You are ready to drive',message:'Your driver verification is complete. You can now publish ReaGae rides.',type:'VERIFICATION_APPROVED'});
    return NextResponse.json({document:{...doc,data:undefined},verified:final});
  }
  if(b.verificationType&&['DRIVER_IDENTITY','DRIVER_FACE','VEHICLE'].includes(b.verificationType)&&['VERIFIED','REJECTED'].includes(b.status)){
    const type=b.verificationType;
    if(type==='DRIVER_IDENTITY') await db.driverProfile.update({where:{userId:id},data:{identityVerificationStatus:b.status}});
    if(type==='DRIVER_FACE') await db.driverProfile.update({where:{userId:id},data:{faceVerificationStatus:b.status, ...(b.status==='VERIFIED'?{faceLivenessResult:'PASSED',faceMatchResult:'PASSED'}:{})}});
    if(type==='VEHICLE' && b.vehicleId) await db.vehicle.update({where:{id:String(b.vehicleId)},data:{verificationStatus:b.status}});
    if(b.caseId) await db.verificationCase.update({where:{id:String(b.caseId)},data:{status:b.status}}).catch(()=>undefined);
    const final=await refreshOverall(id);
    if(final) await createNotification({userId:id,title:'Verification approved 🎉',message:'You are verified and can now publish rides.',type:'VERIFICATION_APPROVED'});
    return NextResponse.json({verified:final});
  }
  return NextResponse.json({error:'Unsupported operation'},{status:400});
}
