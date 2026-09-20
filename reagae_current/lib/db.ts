import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolClient } from "pg";
import { eq, and, or, inArray, gte, lte, lt, gt, ilike, isNull, isNotNull, desc, asc, sql } from "drizzle-orm";
import * as s from "./db/schema";
import crypto from "node:crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const pool = new Pool({ connectionString, max: 10 });
export const database = drizzle(pool);

type Executor = typeof database;
const tables: Record<string, any> = {
  user: s.users, driverProfile: s.driverProfiles, riderProfile: s.riderProfiles,
  vehicle: s.vehicles, ride: s.rides, booking: s.bookings, rating: s.ratings,
  safetyReport: s.safetyReports, verificationCase: s.verificationCases,
  notification: s.notifications, driverDocument:s.driverDocuments, rideLocation:s.rideLocations, trackingShare:s.trackingShares, paymentMethod:s.paymentMethods, payment:s.payments, supportCase:s.supportCases, emailVerificationToken: s.emailVerificationTokens,
  passwordResetToken: s.passwordResetTokens, tip: s.tips, experienceContent: s.experienceContents, phoneVerificationCode: s.phoneVerificationCodes, riderVerificationDocument:s.riderVerificationDocuments, riderRideVerification:s.riderRideVerifications, safetyMedia:s.safetyMedia, supportRequest:s.supportRequests, supportMessage:s.supportMessages,
  session: s.sessions,
};

const now = () => new Date();
const id = () => crypto.randomUUID();

function column(table: any, key: string) {
  return table[key];
}

function condition(table: any, where: any): any {
  if (!where) return undefined;
  if (where.OR) return or(...where.OR.map((x: any) => condition(table, x)));
  if (where.AND) return and(...where.AND.map((x: any) => condition(table, x)));
  const parts: any[] = [];
  for (const [key, raw] of Object.entries(where)) {
    if (key === "ride" && (raw as any)?.driverId) continue;
    const col = column(table, key);
    if (!col) continue;
    if (raw !== null && typeof raw === "object" && !Array.isArray(raw) && !(raw instanceof Date)) {
      if ("in" in raw) parts.push(inArray(col, raw.in as any[]));
      else if ("gte" in raw) parts.push(gte(col, raw.gte));
      else if ("lte" in raw) parts.push(lte(col, raw.lte));
      else if ("lt" in raw) parts.push(lt(col, raw.lt));
      else if ("gt" in raw) parts.push(gt(col, raw.gt));
      else if ("contains" in raw) parts.push(ilike(col, `%${String(raw.contains)}%`));
      else if ("equals" in raw) parts.push(eq(col, raw.equals));
    } else if (raw === null) parts.push(isNull(col));
    else parts.push(eq(col, raw as any));
  }
  return parts.length ? and(...parts) : undefined;
}

function safeSelect(row: any, select?: any) {
  if (!select) return row;
  const out: any = {};
  for (const k of Object.keys(select)) if (select[k] && k in row) out[k] = row[k];
  return out;
}

function baseData(data: any) {
  const out = { ...data };
  const t = now();
  if (!out.id) out.id = id();
  if (!out.createdAt) out.createdAt = t;
  if (!out.updatedAt) out.updatedAt = t;
  return out;
}

function applyData(old: any, data: any) {
  const out: any = { ...data };
  for (const [k,v] of Object.entries(out)) {
    if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      if ("increment" in (v as any)) out[k] = Number(old[k] || 0) + Number((v as any).increment);
      if ("decrement" in (v as any)) out[k] = Number(old[k] || 0) - Number((v as any).decrement);
    }
  }
  out.updatedAt = now();
  return out;
}

async function includeRelations(model: string, row: any, include: any, executor: any): Promise<any> {
  if (!row || !include) return row;
  const out = { ...row };
  if (model === "user") {
    if (include.driverProfile) out.driverProfile = await new Model("driverProfile", executor).findUnique({where:{userId:row.id}});
    if (include.riderProfile) out.riderProfile = await new Model("riderProfile", executor).findUnique({where:{userId:row.id}});
  }
  if (model === "ride") {
    if (include.driver) {
      const u = await new Model("user", executor).findUnique({where:{id:row.driverId}, select:include.driver.select});
      out.driver = u;
    }
    if (include.vehicle) out.vehicle = await new Model("vehicle", executor).findUnique({where:{id:row.vehicleId}});
    if (include.bookings) {
      const bs = await new Model("booking", executor).findMany({where:{rideId:row.id}, include:include.bookings.include});
      out.bookings = bs;
    }
  }
  if (model === "booking") {
    if (include.ride) out.ride = await new Model("ride", executor).findUnique({where:{id:row.rideId}, include:include.ride.include});
    if (include.rider) out.rider = await new Model("user", executor).findUnique({where:{id:row.riderId}, select:include.rider.select});
  }
  if (model === "rating") {
    if (include.fromUser) out.fromUser = await new Model("user", executor).findUnique({where:{id:row.fromUserId},select:include.fromUser.select});
    if (include.toUser) out.toUser = await new Model("user", executor).findUnique({where:{id:row.toUserId},select:include.toUser.select});
    if (include.ride) out.ride = await new Model("ride", executor).findUnique({where:{id:row.rideId},select:include.ride.select});
  }
  if (model === "driverProfile" && include.user) out.user = await new Model("user", executor).findUnique({where:{id:row.userId},select:include.user.select});
  return out;
}

class Model {
  constructor(private name: string, private executor: any = database) {}
  private get table() { return tables[this.name]; }

  async findMany(opts:any={}) {
    const q = this.executor.select().from(this.table);
    let rows = await (opts.where ? q.where(condition(this.table, opts.where)) : q);
    if (opts.orderBy) {
      const orders = Array.isArray(opts.orderBy) ? opts.orderBy : [opts.orderBy];
      for (const o of orders) {
        const [k,v] = Object.entries(o)[0] as [string,string];
        rows = rows.sort((a:any,b:any) => v==="desc" ? (b[k]>a[k]?1:b[k]<a[k]?-1:0) : (a[k]>b[k]?1:a[k]<b[k]?-1:0));
      }
    }
    if ((opts.where?.ride as any)?.driverId && this.name === "booking") {
      const allowedRides = await new Model("ride", this.executor).findMany({ where: { driverId: (opts.where.ride as any).driverId }, select: { id: true } });
      const ids = new Set(allowedRides.map((r:any) => r.id));
      rows = rows.filter((r:any) => ids.has(r.rideId));
    }
    if (opts.take) rows = rows.slice(0, opts.take);
    if (opts.include) {
      const mapped=[]; for (const r of rows) mapped.push(await includeRelations(this.name,r,opts.include,this.executor)); rows=mapped;
    }
    if (opts.select) rows=rows.map((r:any)=>safeSelect(r,opts.select));
    return rows;
  }
  async findFirst(opts:any={}) { const rows=await this.findMany({...opts,take:1}); return rows[0]??null; }
  async findUnique(opts:any={}) { const rows=await this.findMany(opts); return rows[0]??null; }

  async create(opts:any) {
    const data=baseData(opts.data);
    if (data.driverProfile?.create) { const x=data.driverProfile; delete data.driverProfile; }
    if (data.riderProfile?.create) { const x=data.riderProfile; delete data.riderProfile; }
    const [created]=await this.executor.insert(this.table).values(data).returning();
    if (opts.data.driverProfile?.create) await new Model("driverProfile",this.executor).create({data:{userId:created.id,...opts.data.driverProfile.create}});
    if (opts.data.riderProfile?.create) await new Model("riderProfile",this.executor).create({data:{userId:created.id,...opts.data.riderProfile.create}});
    let result=created;
    if(opts.include) result=await includeRelations(this.name,created,opts.include,this.executor);
    if(opts.select) result=safeSelect(result,opts.select);
    return result;
  }

  async upsert(opts:any) {
    const existing = await this.findUnique({ where: opts.where });
    if (existing) return this.update({ where: opts.where, data: opts.update, include: opts.include, select: opts.select });
    return this.create({ data: opts.create, include: opts.include, select: opts.select });
  }
  async update(opts:any) {
    const where=condition(this.table,opts.where);
    const old=(await this.executor.select().from(this.table).where(where).limit(1))[0];
    if(!old) throw new Error(`${this.name} record not found`);
    const data=applyData(old,opts.data);
    const [updated]=await this.executor.update(this.table).set(data).where(where).returning();
    let result=updated;
    if(opts.include) result=await includeRelations(this.name,updated,opts.include,this.executor);
    if(opts.select) result=safeSelect(result,opts.select);
    return result;
  }
  async updateMany(opts:any) {
    const where=condition(this.table,opts.where);
    const old=await this.executor.select().from(this.table).where(where);
    let count=0;
    for(const row of old){ await this.executor.update(this.table).set(applyData(row,opts.data)).where(eq(this.table.id,row.id)); count++; }
    return {count};
  }
  async delete(opts:any) { const where=condition(this.table,opts.where); const [r]=await this.executor.delete(this.table).where(where).returning(); return r; }
  async deleteMany(opts:any={}) { const where=condition(this.table,opts.where); const rows=await this.executor.select().from(this.table).where(where); for(const r of rows) await this.executor.delete(this.table).where(eq(this.table.id,r.id)); return {count:rows.length}; }
  async createMany(opts:any={}) {
    const data = (opts.data || []).map((x:any) => baseData(x));
    if (!data.length) return { count: 0 };
    await this.executor.insert(this.table).values(data);
    return { count: data.length };
  }
  async aggregate(opts:any) {
    const rows=await this.findMany({where:opts.where});
    const scores=rows.map((r:any)=>Number(r.score)).filter(Number.isFinite);
    return {_avg:{score:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null},_count:{id:rows.length}};
  }
}

const queryRaw = (strings: TemplateStringsArray, ...values: any[]) => {
  const text = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""), "");
  return pool.query(text, values).then(r => r.rows);
};

export const db = Object.assign({
  user:new Model("user"), driverProfile:new Model("driverProfile"), riderProfile:new Model("riderProfile"),
  vehicle:new Model("vehicle"), ride:new Model("ride"), booking:new Model("booking"), rating:new Model("rating"),
  safetyReport:new Model("safetyReport"), verificationCase:new Model("verificationCase"), notification:new Model("notification"), driverDocument:new Model("driverDocument"), rideLocation:new Model("rideLocation"), trackingShare:new Model("trackingShare"), paymentMethod:new Model("paymentMethod"), payment:new Model("payment"), supportCase:new Model("supportCase"),
  emailVerificationToken:new Model("emailVerificationToken"), passwordResetToken:new Model("passwordResetToken"), tip:new Model("tip"), experienceContent:new Model("experienceContent"),
  phoneVerificationCode:new Model("phoneVerificationCode"), riderVerificationDocument:new Model("riderVerificationDocument"), riderRideVerification:new Model("riderRideVerification"), safetyMedia:new Model("safetyMedia"), supportRequest:new Model("supportRequest"), supportMessage:new Model("supportMessage"), session:new Model("session"),
  $queryRaw: queryRaw,
  async $transaction(arg:any):Promise<any> {
    if (typeof arg === "function") return database.transaction(async (tx:any)=>arg(Object.assign({$transaction:undefined}, {
      user:new Model("user",tx),driverProfile:new Model("driverProfile",tx),riderProfile:new Model("riderProfile",tx),
      vehicle:new Model("vehicle",tx),ride:new Model("ride",tx),booking:new Model("booking",tx),rating:new Model("rating",tx),
      safetyReport:new Model("safetyReport",tx),verificationCase:new Model("verificationCase",tx),notification:new Model("notification",tx),driverDocument:new Model("driverDocument",tx),rideLocation:new Model("rideLocation",tx),trackingShare:new Model("trackingShare",tx),paymentMethod:new Model("paymentMethod",tx),payment:new Model("payment",tx),supportCase:new Model("supportCase",tx),
      emailVerificationToken:new Model("emailVerificationToken",tx),passwordResetToken:new Model("passwordResetToken",tx),tip:new Model("tip",tx),experienceContent:new Model("experienceContent",tx),
      phoneVerificationCode:new Model("phoneVerificationCode",tx),riderVerificationDocument:new Model("riderVerificationDocument",tx),riderRideVerification:new Model("riderRideVerification",tx),safetyMedia:new Model("safetyMedia",tx),supportRequest:new Model("supportRequest",tx),supportMessage:new Model("supportMessage",tx),session:new Model("session",tx)
    })));
    return Promise.all(arg);
  }
}, { raw: database });
export type Db = typeof db;
