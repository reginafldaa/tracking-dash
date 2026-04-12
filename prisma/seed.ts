import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Cek apakah admin sudah ada
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash("password123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Administrator",
        email: "admin@example.com",
        password: adminPassword,
        role: "ADMIN",
      },
    });
    console.log(`Admin created: ${admin.email}`);
  } else {
    console.log("Admin already exists.");
  }

  // Cek apakah user sudah ada
  const existingUser = await prisma.user.findUnique({
    where: { email: "user@example.com" },
  });

  if (!existingUser) {
    const userPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        name: "Regular User",
        email: "user@example.com",
        password: userPassword,
        role: "USER",
      },
    });
    console.log(`User created: ${user.email}`);
  } else {
    console.log("User already exists.");
  }

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
