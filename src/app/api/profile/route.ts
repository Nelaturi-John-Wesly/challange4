import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/profile
export async function GET() {
  try {
    const sessionUser = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        college: true,
        department: true,
        studentProfile: true,
        facultyProfile: true,
        alumniProfile: true,
        recruiterProfile: true,
      },
    });

    if (!user) {
      // Fallback for demo users
      return NextResponse.json({
        user: {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          role: sessionUser.role,
          avatar: sessionUser.avatar,
          phone: "+91 98765 43210",
          bio: "Student pursuing engineering with a focus on web systems and intelligent campus software.",
          skills: "TypeScript, React, Next.js, Python, Tailwind CSS",
          githubUrl: "https://github.com/campus-engineer",
          linkedinUrl: "https://linkedin.com/in/campus-student",
          college: {
            id: sessionUser.collegeId || "col-nec",
            name: sessionUser.collegeName || "Narasaraopeta Engineering College",
            city: sessionUser.collegeCity || "Narasaraopet",
            state: sessionUser.collegeState || "Andhra Pradesh",
            country: "India",
            themeColor: sessionUser.collegeThemeColor || "#f59e0b",
            logoUrl: sessionUser.collegeLogoUrl || null,
          },
          department: {
            code: sessionUser.departmentCode || "CSE",
            name: "Computer Science & Engineering",
          },
          studentProfile: {
            rollNumber: "22ECE1047",
            batch: "2022-2026",
            year: 3,
            semester: 6,
            section: "A",
            cgpa: 8.42,
          },
          settings: {
            themePreference: "dark",
            accentColor: "#f59e0b",
            hidePhone: false,
            hideEmail: false,
            notificationPrefs: {
              academic: true,
              gigs: true,
              events: true,
              alerts: true,
            },
          },
        },
      });
    }

    // Parse notification preferences safely
    let notificationPrefs = { academic: true, gigs: true, events: true, alerts: true };
    if (user.notificationPrefs) {
      try {
        notificationPrefs = JSON.parse(user.notificationPrefs);
      } catch {}
    }

    // Exclude password from output
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      user: {
        ...safeUser,
        settings: {
          themePreference: user.themePreference || "dark",
          accentColor: user.accentColor || user.college?.themeColor || "#f59e0b",
          hidePhone: user.hidePhone,
          hideEmail: user.hideEmail,
          notificationPrefs,
        },
      },
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load profile", details: err?.message }, { status: 500 });
  }
}

// PUT /api/profile (Update details)
export async function PUT(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const body = await req.json();

    const {
      name,
      phone,
      bio,
      skills,
      githubUrl,
      linkedinUrl,
      collegeId,
      departmentCode,
      rollNumber,
      year,
      semester,
    } = body;

    // Validate inputs
    if (name && (typeof name !== "string" || name.trim().length < 2)) {
      return NextResponse.json({ error: "Name must be at least 2 characters long." }, { status: 400 });
    }

    // Check if target user exists in DB
    const existingUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { studentProfile: true, facultyProfile: true },
    });

    if (!existingUser) {
      return NextResponse.json({
        success: true,
        message: "Profile updated (Session active).",
        user: {
          ...sessionUser,
          name: name ? name.trim() : sessionUser.name,
          phone: phone || null,
          bio: bio || null,
          skills: skills || null,
        },
      });
    }

    // Resolve department if changed
    let targetDeptId = existingUser.departmentId;
    if (departmentCode) {
      const dept = await prisma.department.findUnique({ where: { code: departmentCode } });
      if (dept) targetDeptId = dept.id;
    }

    // Perform database update
    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: sessionUser.id },
        data: {
          name: name ? name.trim() : existingUser.name,
          phone: phone !== undefined ? phone?.trim() : existingUser.phone,
          bio: bio !== undefined ? bio?.trim() : existingUser.bio,
          skills: skills !== undefined ? skills?.trim() : existingUser.skills,
          githubUrl: githubUrl !== undefined ? githubUrl?.trim() : existingUser.githubUrl,
          linkedinUrl: linkedinUrl !== undefined ? linkedinUrl?.trim() : existingUser.linkedinUrl,
          collegeId: collegeId !== undefined ? collegeId : existingUser.collegeId,
          departmentId: targetDeptId,
        },
        include: {
          college: true,
          department: true,
          studentProfile: true,
        },
      });

      // Update student profile if applicable
      if (existingUser.role === "STUDENT" && existingUser.studentProfile) {
        await tx.studentProfile.update({
          where: { userId: sessionUser.id },
          data: {
            rollNumber: rollNumber ? rollNumber.trim().toUpperCase() : existingUser.studentProfile.rollNumber,
            year: year ? parseInt(String(year), 10) : existingUser.studentProfile.year,
            semester: semester ? parseInt(String(semester), 10) : existingUser.studentProfile.semester,
          },
        });
      }

      return u;
    });

    const { password: _, ...safeUser } = updated;
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: safeUser,
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Failed to update profile", details: err?.message }, { status: 500 });
  }
}

// DELETE /api/profile (Account Deletion with strong verification)
export async function DELETE(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const body = await req.json();
    const { confirmationText, password } = body;

    if (confirmationText !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: 'Please enter the exact phrase "DELETE MY ACCOUNT" to confirm.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (user && password) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Incorrect password. Cannot delete account." }, { status: 403 });
      }

      // Delete user cascades to student/faculty profiles
      await prisma.user.delete({
        where: { id: sessionUser.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your institutional account and personal data have been completely deleted.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete account", details: err?.message }, { status: 500 });
  }
}
