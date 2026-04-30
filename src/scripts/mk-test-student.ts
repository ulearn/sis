import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

dotenv.config({ path: "/home/sis/web/sis.ulearnschool.com/public_html/sis/.env" });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function main() {
  const password = "NeilTest26!";
  const hash = bcrypt.hashSync(password, 10);
  const user = await prisma.sisUser.upsert({
    where: { username: "test.student" },
    update: { passwordHash: hash, active: true, role: "student", userType: "student", email: "neilsjmcmahon@gmail.com" },
    create: {
      username: "test.student",
      passwordHash: hash,
      displayName: "Neil Test26 (student)",
      role: "student",
      userType: "student",
      email: "neilsjmcmahon@gmail.com",
      active: true,
    },
  });
  console.log("user:", { id: user.id, username: user.username, role: user.role, email: user.email });
  console.log("password:", password);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
