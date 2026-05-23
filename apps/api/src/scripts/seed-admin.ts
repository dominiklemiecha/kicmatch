import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import * as argon2 from "argon2";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://kicmatch:kicmatch@localhost:5434/kicmatch";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL ?? "admin@kicmatch.local";
  const password = process.env.ADMIN_PASSWORD ?? "AdminKicmatch2026!";
  const firstName = process.env.ADMIN_FIRST_NAME ?? "Super";
  const lastName = process.env.ADMIN_LAST_NAME ?? "Admin";
  const passwordHash = await argon2.hash(password);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: "SUPERADMIN" } });
    console.log(`Utente esistente ${email} promosso a SUPERADMIN`);
    return;
  }
  await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role: "SUPERADMIN", emailVerified: true },
  });
  console.log(`Superadmin creato: ${email} / ${password}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
