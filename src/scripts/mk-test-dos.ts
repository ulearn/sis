import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

dotenv.config({ path: "/home/sis/web/sis.ulearnschool.com/public_html/sis/.env" });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function main() {
  const password = "DosTest26!";
  const hash = bcrypt.hashSync(password, 10);
  const user = await prisma.sisUser.upsert({
    where: { username: "test.dos" },
    update: { passwordHash: hash, active: true, role: "dos", userType: "staff" },
    create: {
      username: "test.dos",
      passwordHash: hash,
      displayName: "Test DOS",
      role: "dos",
      userType: "staff",
      email: "test.dos@ulearnschool.com",
      active: true,
    },
  });
  console.log("user:", { id: user.id, username: user.username, role: user.role });
  console.log("password:", password);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
