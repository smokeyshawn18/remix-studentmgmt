import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../app/lib/auth.server";

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create admin user
    const hashedPassword = await hashPassword("adminpassword");
    await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin user created successfully!");

    // Create some demo courses
    const courses = [
      {
        name: "Mathematics 101",
        description: "Introduction to basic mathematical concepts",
        startDate: new Date("2025-09-01"),
        endDate: new Date("2025-12-15"),
      },
      {
        name: "English Literature",
        description: "Study of classic literary works",
        startDate: new Date("2025-09-01"),
        endDate: new Date("2025-12-15"),
      },
      {
        name: "Computer Science Fundamentals",
        description: "Introduction to programming and algorithms",
        startDate: new Date("2025-09-01"),
        endDate: new Date("2025-12-15"),
      },
    ];

    for (const course of courses) {
      await prisma.course.create({ data: course });
    }
    console.log("Demo courses created successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
