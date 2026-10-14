import { PrismaClient } from "@prisma/client";
import { INITIAL_CAMPUS_GIGS, INITIAL_GIG_APPLICATIONS, INITIAL_GIG_SUBMISSIONS, INITIAL_GIG_RATINGS, INITIAL_GIG_TRANSACTIONS } from "../src/lib/gigs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Campus Gigs into Prisma SQLite...");

  for (const gig of INITIAL_CAMPUS_GIGS) {
    const categoryEnumMap: Record<string, any> = {
      "Teaching/Tutoring": "TEACHING_TUTORING",
      "Events Help": "EVENTS_HELP",
      "Lab/Research Assistance": "LAB_RESEARCH",
      "Design/Content": "DESIGN_CONTENT",
      "Data Entry/Documentation": "DATA_ENTRY",
      "Tech/Coding": "TECH_CODING",
      "Errands/Campus Help": "CAMPUS_ERRANDS",
      "Other": "OTHER",
    };

    const locationEnumMap: Record<string, any> = {
      "On-campus": "ON_CAMPUS",
      "Remote": "REMOTE",
    };

    await prisma.campusGig.upsert({
      where: { id: gig.id },
      update: {
        title: gig.title,
        description: gig.description,
        category: categoryEnumMap[gig.category] || "OTHER",
        postedById: gig.postedBy.id,
        posterName: gig.postedBy.name,
        posterRole: gig.postedBy.role,
        posterDepartment: gig.postedBy.department,
        posterVerified: gig.postedBy.verified,
        rewardType: gig.rewardType as any,
        rewardAmount: gig.rewardAmount,
        rewardDescription: gig.rewardDescription,
        numberOfSlots: gig.numberOfSlots,
        slotsFilled: gig.slotsFilled,
        deadline: new Date(gig.deadline),
        estimatedHours: gig.estimatedHours,
        location: locationEnumMap[gig.location] || "ON_CAMPUS",
        locationDetails: gig.locationDetails,
        requiredSkills: gig.requiredSkills.join(", "),
        status: gig.status as any,
      },
      create: {
        id: gig.id,
        title: gig.title,
        description: gig.description,
        category: categoryEnumMap[gig.category] || "OTHER",
        postedById: gig.postedBy.id,
        posterName: gig.postedBy.name,
        posterRole: gig.postedBy.role,
        posterDepartment: gig.postedBy.department,
        posterVerified: gig.postedBy.verified,
        rewardType: gig.rewardType as any,
        rewardAmount: gig.rewardAmount,
        rewardDescription: gig.rewardDescription,
        numberOfSlots: gig.numberOfSlots,
        slotsFilled: gig.slotsFilled,
        deadline: new Date(gig.deadline),
        estimatedHours: gig.estimatedHours,
        location: locationEnumMap[gig.location] || "ON_CAMPUS",
        locationDetails: gig.locationDetails,
        requiredSkills: gig.requiredSkills.join(", "),
        status: gig.status as any,
      },
    });
  }

  for (const app of INITIAL_GIG_APPLICATIONS) {
    await prisma.gigApplication.upsert({
      where: { id: app.id },
      update: {
        status: app.status as any,
      },
      create: {
        id: app.id,
        gigId: app.gigId,
        studentId: app.studentId,
        studentName: app.studentName,
        studentEmail: app.studentEmail,
        studentDept: app.studentDept,
        studentYear: app.studentYear,
        studentRating: app.studentRating || 5.0,
        message: app.message,
        status: app.status as any,
        appliedAt: new Date(app.appliedAt),
      },
    });
  }

  console.log("Successfully seeded Campus Gigs into SQLite!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
