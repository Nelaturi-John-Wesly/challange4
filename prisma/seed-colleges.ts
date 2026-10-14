import { PrismaClient } from "@prisma/client";
import { getCollegeLogoConfig } from "../src/lib/college";

const prisma = new PrismaClient();

export const SAMPLE_COLLEGES = [
  {
    name: "Narasaraopeta Engineering College",
    city: "Narasaraopet",
    state: "Andhra Pradesh",
    country: "India",
    themeColor: "#f59e0b", // Electric Amber
  },
  {
    name: "Indian Institute of Technology Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    themeColor: "#0ea5e9", // Neon Sky
  },
  {
    name: "Delhi Technological University",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    themeColor: "#8b5cf6", // Cyber Violet
  },
  {
    name: "National Institute of Technology Karnataka",
    city: "Surathkal",
    state: "Karnataka",
    country: "India",
    themeColor: "#10b981", // Emerald Matrix
  },
  {
    name: "BITS Pilani",
    city: "Pilani",
    state: "Rajasthan",
    country: "India",
    themeColor: "#f43f5e", // Crimson Rose
  },
];

async function seedColleges() {
  console.log("🏫 Seeding 5 sample colleges with deterministic logos...");

  const createdColleges: Record<string, any> = {};

  for (const c of SAMPLE_COLLEGES) {
    const cfg = getCollegeLogoConfig(c.name, c.themeColor);
    const college = await prisma.college.upsert({
      where: { name: c.name },
      update: {
        city: c.city,
        state: c.state,
        country: c.country,
        themeColor: c.themeColor,
        logoSeed: cfg.initials,
      },
      create: {
        name: c.name,
        city: c.city,
        state: c.state,
        country: c.country,
        themeColor: c.themeColor,
        logoSeed: cfg.initials,
        isVerified: true,
      },
    });
    createdColleges[c.name] = college;
    console.log(`  ✓ ${college.name} (${college.city}, ${college.state}) [${cfg.initials} - ${college.themeColor}]`);
  }

  // Link existing users to default college (Narasaraopeta Engineering College) if null
  const defaultCollege = createdColleges["Narasaraopeta Engineering College"];
  if (defaultCollege) {
    const unassignedCount = await prisma.user.count({
      where: { collegeId: null },
    });
    if (unassignedCount > 0) {
      console.log(`Associating ${unassignedCount} existing users with default college...`);
      await prisma.user.updateMany({
        where: { collegeId: null },
        data: { collegeId: defaultCollege.id },
      });
      console.log(`  ✓ Updated ${unassignedCount} users with collegeId = ${defaultCollege.id}`);
    }
  }

  console.log("🎉 College seed finished successfully.");
}

seedColleges()
  .catch((e) => {
    console.error("Error seeding colleges:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
