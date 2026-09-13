import crypto from "node:crypto";
import pg from "pg";
const { Client } = pg;
const USERNAME = "rea_gae_admin";
const PASSWORD = "rea_gae_2026";
const salt = crypto.randomBytes(16).toString("hex");
const key = crypto.scryptSync(PASSWORD, salt, 64).toString("hex");
const hash = `scrypt:${salt}:${key}`;
const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const existing = await c.query(`SELECT "id" FROM "User" WHERE "username"=$1 OR "email"=$2 LIMIT 1`, [USERNAME, "rea_gae_admin@reagae.local"]);
if (existing.rows.length) {
  await c.query(`UPDATE "User" SET "username"=$1,"passwordHash"=$2,"role"='ADMIN',"accountStatus"='ACTIVE',"emailVerified"=true,"phoneVerified"=true,"updatedAt"=NOW() WHERE "id"=$3`, [USERNAME, hash, existing.rows[0].id]);
  console.log(`Admin credentials reset for ${USERNAME}`);
} else {
  await c.query(`INSERT INTO "User" ("id","createdAt","updatedAt","firstName","lastName","email","phone","username","passwordHash","role","accountStatus","emailVerified","phoneVerified","ratingAverage","ratingCount") VALUES ($1,NOW(),NOW(),'ReaGae','Administrator',$2,$3,$4,$5,'ADMIN','ACTIVE',true,true,0,0)`, [crypto.randomUUID(), "rea_gae_admin@reagae.local", "+27000000000", USERNAME, hash]);
  console.log(`Admin created: ${USERNAME}`);
}
await c.end();
