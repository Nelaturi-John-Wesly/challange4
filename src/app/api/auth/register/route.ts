import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

// GET: Returns department options for the registration dropdown
const DEFAULT_DEPARTMENTS = [
  { id: "dept-cse", code: "CSE", name: "Computer Science & Engineering" },
  { id: "dept-ece", code: "ECE", name: "Electronics & Communication Engineering" },
  { id: "dept-it", code: "IT", name: "Information Technology" },
  { id: "dept-mech", code: "MECH", name: "Mechanical Engineering" },
  { id: "dept-civil", code: "CIVIL", name: "Civil Engineering" },
];

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { code: "asc" },
    });
    if (!departments || departments.length === 0) {
      return NextResponse.json({ departments: DEFAULT_DEPARTMENTS });
    }
    return NextResponse.json({ departments });
  } catch (_err: any) {
    return NextResponse.json({ departments: DEFAULT_DEPARTMENTS });
  }
}

// POST: Comprehensive User Registration with complete details & role profiles
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      role = "STUDENT",
      departmentCode,
      // Student details
      rollNumber,
      batch,
      year,
      semester,
      section,
      bloodGroup,
      emergencyContact,
      // Faculty details
      employeeId,
      designation,
      qualification,
      cabinNumber,
      // Alumni details
      graduationYear,
      degree,
      company,
      alumniDesignation,
      industry,
      linkedinUrl,
      // Recruiter details
      companyName,
      recruiterIndustry,
      website,
    } = body;

    // 1. Basic validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide a valid full name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid institutional email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 2. Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this institutional email already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    // 3. Resolve Department
    let targetDepartment = null;
    if (departmentCode) {
      targetDepartment = await prisma.department.findUnique({
        where: { code: departmentCode },
      });
    }

    if (!targetDepartment) {
      // Fallback to first available department
      targetDepartment = await prisma.department.findFirst();
    }

    // 4. Role-specific validation & duplicate check
    const normalizedRole = (role || "STUDENT").toUpperCase() as Role;

    if (normalizedRole === "STUDENT") {
      if (!rollNumber || rollNumber.trim().length < 2) {
        return NextResponse.json(
          { error: "Roll Number / Registration Number is required for students." },
          { status: 400 }
        );
      }
      const existingRoll = await prisma.studentProfile.findUnique({
        where: { rollNumber: rollNumber.trim().toUpperCase() },
      });
      if (existingRoll) {
        return NextResponse.json(
          { error: `Roll Number '${rollNumber.trim().toUpperCase()}' is already registered.` },
          { status: 409 }
        );
      }
    } else if (normalizedRole === "FACULTY") {
      if (!employeeId || employeeId.trim().length < 2) {
        return NextResponse.json(
          { error: "Faculty Employee ID is required." },
          { status: 400 }
        );
      }
      const existingEmp = await prisma.facultyProfile.findUnique({
        where: { employeeId: employeeId.trim().toUpperCase() },
      });
      if (existingEmp) {
        return NextResponse.json(
          { error: `Employee ID '${employeeId.trim().toUpperCase()}' is already registered.` },
          { status: 409 }
        );
      }
    }

    // 5. Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Generate QR Code for Student ID card if student
    let studentQrDataUrl = null;
    const cleanRollNumber = rollNumber ? rollNumber.trim().toUpperCase() : null;
    if (normalizedRole === "STUDENT" && cleanRollNumber) {
      try {
        studentQrDataUrl = await QRCode.toDataURL(
          JSON.stringify({
            rollNumber: cleanRollNumber,
            name: name.trim(),
            email: cleanEmail,
            dept: targetDepartment?.code || "GEN",
            verified: true,
          }),
          { width: 280, margin: 2 }
        );
      } catch {
        studentQrDataUrl = null;
      }
    }

    // 7. Atomic Prisma Transaction: Create User + Role Profile + Notification + Enrollments
    const newUser = await prisma.$transaction(async (tx) => {
      // Create primary User record
      const createdUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          phone: phone ? phone.trim() : null,
          role: normalizedRole,
          departmentId: targetDepartment?.id || null,
        },
      });

      // Create Role Profile with complete details
      if (normalizedRole === "STUDENT") {
        const studentYear = parseInt(String(year || 1), 10);
        const studentSem = parseInt(String(semester || 1), 10);

        await tx.studentProfile.create({
          data: {
            userId: createdUser.id,
            rollNumber: cleanRollNumber || `STD-${Date.now().toString().slice(-6)}`,
            batch: batch ? batch.trim() : "2024-2028",
            year: isNaN(studentYear) ? 1 : studentYear,
            semester: isNaN(studentSem) ? 1 : studentSem,
            section: section ? section.trim().toUpperCase() : "A",
            cgpa: 8.2, // Default initial CGPA
            bloodGroup: bloodGroup ? bloodGroup.trim().toUpperCase() : "O+",
            emergencyContact: emergencyContact ? emergencyContact.trim() : null,
            qrCodeUrl: studentQrDataUrl,
          },
        });

        // Auto-enroll student into department courses for this semester if available
        if (targetDepartment) {
          const matchingCourses = await tx.course.findMany({
            where: {
              departmentId: targetDepartment.id,
              semester: isNaN(studentSem) ? 1 : studentSem,
            },
            take: 6,
          });

          for (const course of matchingCourses) {
            await tx.subjectEnrollment.create({
              data: {
                studentId: createdUser.id,
                courseId: course.id,
                semester: isNaN(studentSem) ? 1 : studentSem,
              },
            });
          }
        }
      } else if (normalizedRole === "FACULTY") {
        await tx.facultyProfile.create({
          data: {
            userId: createdUser.id,
            employeeId: employeeId ? employeeId.trim().toUpperCase() : `FAC-${Date.now().toString().slice(-4)}`,
            designation: designation ? designation.trim() : "Assistant Professor",
            qualification: qualification ? qualification.trim() : "M.Tech, Ph.D.",
            cabinNumber: cabinNumber ? cabinNumber.trim() : "Faculty Room 102",
          },
        });
      } else if (normalizedRole === "ALUMNI") {
        const gradYr = parseInt(String(graduationYear || 2023), 10);
        await tx.alumniProfile.create({
          data: {
            userId: createdUser.id,
            graduationYear: isNaN(gradYr) ? 2023 : gradYr,
            degree: degree ? degree.trim() : "B.Tech Computer Science",
            company: company ? company.trim() : "Technology Solutions",
            designation: alumniDesignation ? alumniDesignation.trim() : "Software Engineer",
            industry: industry ? industry.trim() : "Information Technology",
            linkedinUrl: linkedinUrl ? linkedinUrl.trim() : null,
            openForMentorship: true,
          },
        });
      } else if (normalizedRole === "RECRUITER") {
        await tx.recruiterProfile.create({
          data: {
            userId: createdUser.id,
            companyName: companyName ? companyName.trim() : "Campus Recruiter Org",
            industry: recruiterIndustry ? recruiterIndustry.trim() : "Technology & Consulting",
            website: website ? website.trim() : null,
            isVerified: true,
          },
        });
      }

      // Welcome Notification
      await tx.notification.create({
        data: {
          userId: createdUser.id,
          title: `Welcome to CampusConnect, ${createdUser.name.split(" ")[0]}!`,
          message:
            "Your institutional account has been created. You can now access your personalized academic timetable, attendance records, and campus life portal.",
          type: "SYSTEM",
          link: "/dashboard",
        },
      });

      return createdUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration completed successfully! You can now log in.",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      {
        error: "Failed to complete registration due to a server error.",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
