export interface PricingInput {
  distanceKm: number;
  seats: number;
  luggageBags: number;
}

export function calculateRidePrice({ distanceKm, seats, luggageBags }: PricingInput): number {
  const base = 35;
  const distanceComponent = Math.max(0, distanceKm) * 1.85;
  const luggageComponent = Math.max(0, luggageBags) * 4;
  const operationalTotal = base + distanceComponent + luggageComponent;
  const suggested = operationalTotal / Math.max(1, seats);
  return Math.max(45, Math.round(suggested / 5) * 5);
}

export function calculateDistanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round((R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))) * 10) / 10;
}


export const CUSTOMER_SERVICE_FEE_RATE = 0.04;
export const DRIVER_PLATFORM_FEE_RATE = 0.03;
export function calculateFees(fare:number){ const customerFee=Math.max(3, Math.round(fare*CUSTOMER_SERVICE_FEE_RATE*100)/100); const driverFee=Math.round(fare*DRIVER_PLATFORM_FEE_RATE*100)/100; return {customerFee,driverFee,totalCharge:Math.round((fare+customerFee)*100)/100,driverPayout:Math.round((fare-driverFee)*100)/100}; }
