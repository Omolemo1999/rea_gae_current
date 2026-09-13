import { calculateFees } from "@/lib/pricing";
export const paymentProvider="PAYSTACK" as const;
export async function paystackRequest(path:string, body:any){const key=process.env.PAYSTACK_SECRET_KEY;if(!key)throw new Error("PAYSTACK_SECRET_KEY is not configured.");const r=await fetch(`https://api.paystack.co/${path}`,{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});const d=await r.json();if(!r.ok||!d.status)throw new Error(d.message||"Payment provider error");return d.data;}
export function kobo(naira:number){return Math.round(naira*100)}
export {calculateFees};
