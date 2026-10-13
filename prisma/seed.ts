import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting realistic seed data population...");

  // 1. Clean existing records in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.grievanceTicket.deleteMany();
  await prisma.cafeteriaOrderItem.deleteMany();
  await prisma.cafeteriaOrder.deleteMany();
  await prisma.cafeteriaItem.deleteMany();
  await prisma.campusFacility.deleteMany();
  await prisma.innovationProject.deleteMany();
  await prisma.researchPaper.deleteMany();
  await prisma.mentorshipRequest.deleteMany();
  await prisma.placementApplication.deleteMany();
  await prisma.placementDrive.deleteMany();
  await prisma.article.deleteMany();
  await prisma.departmentLeaderboard.deleteMany();
  await prisma.sportsFixture.deleteMany();
  await prisma.sportsTeam.deleteMany();
  await prisma.sportsTournament.deleteMany();
  await prisma.eventTicket.deleteMany();
  await prisma.campusEvent.deleteMany();
  await prisma.clubGallery.deleteMany();
  await prisma.clubMember.deleteMany();
  await prisma.club.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.feeInvoice.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.courseMaterial.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.subjectEnrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.alumniProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 2. Departments
  console.log("Creating departments...");
  const deptCse = await prisma.department.create({
    data: {
      code: "CSE",
      name: "Computer Science & Engineering",
      description: "Center for artificial intelligence, systems, and software engineering.",
    },
  });

  const deptEce = await prisma.department.create({
    data: {
      code: "ECE",
      name: "Electronics & Communication Engineering",
      description: "Embedded systems, VLSI design, and telecommunications.",
    },
  });

  const deptMech = await prisma.department.create({
    data: {
      code: "MECH",
      name: "Mechanical Engineering",
      description: "Thermodynamics, robotics, CAD/CAM, and automotive dynamics.",
    },
  });

  const deptIt = await prisma.department.create({
    data: {
      code: "IT",
      name: "Information Technology",
      description: "Cloud infrastructure, cybersecurity, and data architecture.",
    },
  });

  // 3. User Accounts with standard secure passwords
  console.log("Creating users across roles...");
  const studentPw = await bcrypt.hash("Student@123", 10);
  const facultyPw = await bcrypt.hash("Faculty@123", 10);
  const adminPw = await bcrypt.hash("Admin@123", 10);
  const recruiterPw = await bcrypt.hash("Recruiter@123", 10);
  const alumniPw = await bcrypt.hash("Alumni@123", 10);

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@college.edu",
      password: adminPw,
      name: "Dr. Anita Rao",
      role: "ADMIN",
      phone: "+91 98110 11223",
      departmentId: deptCse.id,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  // Faculty: Prof. Sana Iqbal (CSE)
  const faculty1 = await prisma.user.create({
    data: {
      email: "faculty@college.edu",
      password: facultyPw,
      name: "Prof. Sana Iqbal",
      role: "FACULTY",
      phone: "+91 98450 22334",
      departmentId: deptCse.id,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      facultyProfile: {
        create: {
          employeeId: "FAC-CSE-102",
          designation: "Associate Professor",
          qualification: "Ph.D. in Distributed Systems & AI",
          cabinNumber: "Aryabhatta Block, Room 304",
        },
      },
    },
    include: { facultyProfile: true },
  });

  // Faculty: Dr. Rajesh Nair (CSE)
  const faculty2 = await prisma.user.create({
    data: {
      email: "rajesh.faculty@college.edu",
      password: facultyPw,
      name: "Dr. Rajesh Nair",
      role: "FACULTY",
      phone: "+91 98450 33445",
      departmentId: deptCse.id,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      facultyProfile: {
        create: {
          employeeId: "FAC-CSE-108",
          designation: "Professor & HOD",
          qualification: "Ph.D. in Database Systems",
          cabinNumber: "Aryabhatta Block, Room 310",
        },
      },
    },
    include: { facultyProfile: true },
  });

  // Primary Demo Student: Kiran Kumar (3rd Year, Sem 5, Section A)
  const kiranQr = await QRCode.toDataURL("VERIFY:STU:2023CSE042:KIRAN_KUMAR:VALID_2026");
  const studentPrimary = await prisma.user.create({
    data: {
      email: "student@college.edu",
      password: studentPw,
      name: "Kiran Kumar",
      role: "STUDENT",
      phone: "+91 98765 43210",
      departmentId: deptCse.id,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      studentProfile: {
        create: {
          rollNumber: "2023CSE042",
          batch: "2022-2026",
          year: 3,
          semester: 5,
          section: "A",
          cgpa: 8.42,
          bloodGroup: "O+",
          emergencyContact: "+91 98765 11223 (Father)",
          qrCodeUrl: kiranQr,
        },
      },
    },
    include: { studentProfile: true },
  });

  // Peer Cohort Students for attendance marking grid & realistic rankings
  const peerNames = [
    { name: "Aarav Sharma", email: "aarav@college.edu", roll: "2023CSE001", cgpa: 9.15, blood: "B+" },
    { name: "Diya Patel", email: "diya@college.edu", roll: "2023CSE015", cgpa: 8.85, blood: "A+" },
    { name: "Rohan Verma", email: "rohan@college.edu", roll: "2023CSE028", cgpa: 7.20, blood: "AB+" },
    { name: "Ananya Iyer", email: "ananya@college.edu", roll: "2023CSE035", cgpa: 9.40, blood: "O-" },
  ];

  const peerUsers = [];
  for (const peer of peerNames) {
    const qr = await QRCode.toDataURL(`VERIFY:STU:${peer.roll}:${peer.name}:VALID_2026`);
    const u = await prisma.user.create({
      data: {
        email: peer.email,
        password: studentPw,
        name: peer.name,
        role: "STUDENT",
        departmentId: deptCse.id,
        studentProfile: {
          create: {
            rollNumber: peer.roll,
            batch: "2022-2026",
            year: 3,
            semester: 5,
            section: "A",
            cgpa: peer.cgpa,
            bloodGroup: peer.blood,
            emergencyContact: "+91 98000 00000",
            qrCodeUrl: qr,
          },
        },
      },
      include: { studentProfile: true },
    });
    peerUsers.push(u);
  }

  const allCohortStudents = [studentPrimary, ...peerUsers];

  // Recruiter: Google Campus Hiring
  await prisma.user.create({
    data: {
      email: "recruiter@college.edu",
      password: recruiterPw,
      name: "Google Campus Relations",
      role: "RECRUITER",
      phone: "+91 80 6721 8000",
      departmentId: deptCse.id,
      recruiterProfile: {
        create: {
          companyName: "Google India Pvt Ltd",
          website: "https://careers.google.com",
          industry: "Software & Technology",
          isVerified: true,
        },
      },
    },
  });

  // Alumni: Rahul Mehta
  await prisma.user.create({
    data: {
      email: "alumni@college.edu",
      password: alumniPw,
      name: "Rahul Mehta",
      role: "ALUMNI",
      phone: "+91 99887 76655",
      departmentId: deptCse.id,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      alumniProfile: {
        create: {
          graduationYear: 2021,
          degree: "B.Tech Computer Science",
          company: "Microsoft",
          designation: "Senior Software Engineer",
          industry: "Cloud Architecture & AI",
          linkedinUrl: "https://linkedin.com/in/rahul-mehta-demo",
          bio: "Alumni batch of 2021. Happy to review resumes, conduct mock technical interviews, and guide on cloud systems.",
          openForMentorship: true,
        },
      },
    },
  });

  // 4. Courses for CSE Semester 5
  console.log("Creating courses & enrollments...");
  const courses = [
    { code: "CS501", name: "Operating Systems", credits: 4, facultyProfileId: faculty1.facultyProfile!.id },
    { code: "CS502", name: "Database Management Systems", credits: 4, facultyProfileId: faculty2.facultyProfile!.id },
    { code: "CS503", name: "Computer Networks", credits: 3, facultyProfileId: faculty1.facultyProfile!.id },
    { code: "CS504", name: "Software Engineering & Agile", credits: 3, facultyProfileId: faculty2.facultyProfile!.id },
    { code: "CS505", name: "Design & Analysis of Algorithms", credits: 4, facultyProfileId: faculty1.facultyProfile!.id },
  ];

  const createdCourses = [];
  for (const c of courses) {
    const course = await prisma.course.create({
      data: {
        code: c.code,
        name: c.name,
        credits: c.credits,
        semester: 5,
        departmentId: deptCse.id,
      },
    });
    createdCourses.push({ ...course, facultyProfileId: c.facultyProfileId });

    // Enroll all 5 students in this course
    for (const student of allCohortStudents) {
      await prisma.subjectEnrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          semester: 5,
        },
      });
    }
  }

  // 5. Timetable Slots (Weekly Monday to Friday)
  console.log("Creating timetable slots...");
  const scheduleMatrix = [
    // Monday
    { courseIdx: 0, day: 1, start: "09:00", end: "10:00", room: "LHC-201" },
    { courseIdx: 1, day: 1, start: "10:00", end: "11:00", room: "LHC-201" },
    { courseIdx: 2, day: 1, start: "11:15", end: "12:15", room: "LHC-202" },
    { courseIdx: 3, day: 1, start: "13:30", end: "14:30", room: "CS-Lab-1" },
    // Tuesday
    { courseIdx: 4, day: 2, start: "09:00", end: "10:00", room: "LHC-201" },
    { courseIdx: 0, day: 2, start: "10:00", end: "11:00", room: "LHC-201" },
    { courseIdx: 1, day: 2, start: "11:15", end: "12:15", room: "LHC-202" },
    // Wednesday
    { courseIdx: 2, day: 3, start: "09:00", end: "10:00", room: "LHC-201" },
    { courseIdx: 3, day: 3, start: "10:00", end: "11:00", room: "LHC-201" },
    { courseIdx: 4, day: 3, start: "11:15", end: "12:15", room: "LHC-202" },
    // Thursday
    { courseIdx: 0, day: 4, start: "09:00", end: "10:00", room: "LHC-201" },
    { courseIdx: 2, day: 4, start: "10:00", end: "11:00", room: "LHC-201" },
    { courseIdx: 4, day: 4, start: "11:15", end: "12:15", room: "CS-Lab-2" },
    // Friday
    { courseIdx: 1, day: 5, start: "09:00", end: "10:00", room: "LHC-201" },
    { courseIdx: 3, day: 5, start: "10:00", end: "11:00", room: "LHC-201" },
  ];

  for (const s of scheduleMatrix) {
    const targetCourse = createdCourses[s.courseIdx];
    await prisma.timetableSlot.create({
      data: {
        courseId: targetCourse.id,
        facultyId: targetCourse.facultyProfileId,
        dayOfWeek: s.day,
        startTime: s.start,
        endTime: s.end,
        roomNumber: s.room,
        section: "A",
        semester: 5,
      },
    });
  }

  // 6. Attendance Sessions & Records
  // We plant realistic numbers so Kiran Kumar has:
  // CS501: 24 total, 22 present -> 91.7% (Healthy)
  // CS502: 20 total, 18 present -> 90.0% (Healthy)
  // CS503: 18 total, 12 present -> 66.7% (CRITICAL ALERT < 75%! Red highlight!)
  // CS504: 16 total, 13 present -> 81.3% (Good)
  // CS505: 22 total, 20 present -> 90.9% (Healthy)
  console.log("Generating smart attendance sessions and records...");

  const attendanceTargets = [
    { courseIdx: 0, total: 24, kiranPresents: 22 },
    { courseIdx: 1, total: 20, kiranPresents: 18 },
    { courseIdx: 2, total: 18, kiranPresents: 12 }, // < 75%
    { courseIdx: 3, total: 16, kiranPresents: 13 },
    { courseIdx: 4, total: 22, kiranPresents: 20 },
  ];

  for (const target of attendanceTargets) {
    const course = createdCourses[target.courseIdx];
    const startDate = new Date("2026-08-01");

    for (let i = 0; i < target.total; i++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + i * 2);

      const session = await prisma.attendanceSession.create({
        data: {
          courseId: course.id,
          facultyId: course.facultyProfileId,
          date: sessionDate,
          section: "A",
          semester: 5,
          topic: `Lecture Unit ${Math.floor(i / 4) + 1} - Key Topic Discussion #${i + 1}`,
        },
      });

      // Record for Kiran Kumar
      const isKiranPresent = i < target.kiranPresents;
      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: studentPrimary.id,
          status: isKiranPresent ? "PRESENT" : "ABSENT",
          remarks: isKiranPresent ? undefined : "Unexcused absence",
        },
      });

      // Records for peer students
      for (const peer of peerUsers) {
        // mostly present
        const peerPresent = (i + peer.name.length) % 7 !== 0;
        await prisma.attendanceRecord.create({
          data: {
            sessionId: session.id,
            studentId: peer.id,
            status: peerPresent ? "PRESENT" : "ABSENT",
          },
        });
      }
    }
  }

  // 7. Exam Schedules
  console.log("Generating exam schedules...");
  const exams = [
    { courseIdx: 0, type: "MID_TERM", date: new Date("2026-10-25"), time: "10:00 - 12:00", room: "LHC-201", marks: 50 },
    { courseIdx: 1, type: "MID_TERM", date: new Date("2026-10-27"), time: "10:00 - 12:00", room: "LHC-201", marks: 50 },
    { courseIdx: 2, type: "MID_TERM", date: new Date("2026-10-29"), time: "10:00 - 12:00", room: "LHC-202", marks: 50 },
    { courseIdx: 0, type: "PRACTICAL", date: new Date("2026-11-15"), time: "09:00 - 13:00", room: "CS-Lab-1", marks: 50 },
    { courseIdx: 1, type: "PRACTICAL", date: new Date("2026-11-17"), time: "09:00 - 13:00", room: "CS-Lab-2", marks: 50 },
    { courseIdx: 0, type: "SEMESTER_FINAL", date: new Date("2026-12-05"), time: "09:30 - 12:30", room: "Auditorium Hall A", marks: 100 },
    { courseIdx: 1, type: "SEMESTER_FINAL", date: new Date("2026-12-08"), time: "09:30 - 12:30", room: "Auditorium Hall A", marks: 100 },
    { courseIdx: 2, type: "SEMESTER_FINAL", date: new Date("2026-12-11"), time: "09:30 - 12:30", room: "Auditorium Hall B", marks: 100 },
    { courseIdx: 3, type: "SEMESTER_FINAL", date: new Date("2026-12-14"), time: "09:30 - 12:30", room: "Auditorium Hall B", marks: 100 },
    { courseIdx: 4, type: "SEMESTER_FINAL", date: new Date("2026-12-17"), time: "09:30 - 12:30", room: "Auditorium Hall A", marks: 100 },
  ];

  for (const ex of exams) {
    const [start, end] = ex.time.split(" - ");
    await prisma.examSchedule.create({
      data: {
        courseId: createdCourses[ex.courseIdx].id,
        examType: ex.type as any,
        examDate: ex.date,
        startTime: start,
        endTime: end,
        roomNumber: ex.room,
        maxMarks: ex.marks,
      },
    });
  }

  // 8. LMS Course Materials
  console.log("Adding LMS course materials...");
  for (const c of createdCourses) {
    await prisma.courseMaterial.createMany({
      data: [
        {
          courseId: c.id,
          facultyId: c.facultyProfileId,
          title: `${c.code} Official Course Syllabus & Grading Scheme`,
          description: "Approved syllabus with topic roadmap, textbook references, and internal evaluation distribution.",
          fileUrl: `/uploads/sample_${c.code.toLowerCase()}_syllabus.pdf`,
          fileType: "pdf",
        },
        {
          courseId: c.id,
          facultyId: c.facultyProfileId,
          title: "Unit 1 & 2 Complete Lecture Slides (Color Annotated)",
          description: "High-resolution lecture slides with detailed diagrams and worked examples.",
          fileUrl: `/uploads/sample_${c.code.toLowerCase()}_unit1_slides.pdf`,
          fileType: "pdf",
        },
        {
          courseId: c.id,
          facultyId: c.facultyProfileId,
          title: "Mid-Term Question Bank & Practice Problems",
          description: "Previous 5 years sessional examination questions with answer keys.",
          fileUrl: `/uploads/sample_${c.code.toLowerCase()}_practice.pdf`,
          fileType: "pdf",
        },
      ],
    });
  }

  // 9. LMS Assignments & Submissions
  console.log("Creating LMS assignments & student submissions...");
  // Assignment 1: Graded
  const assign1 = await prisma.assignment.create({
    data: {
      courseId: createdCourses[0].id, // CS501
      facultyId: createdCourses[0].facultyProfileId,
      title: "Banker's Algorithm & Resource Allocation Graph Simulation",
      description: "Implement Banker's Deadlock Avoidance algorithm in C/C++ or Python. Handle dynamic thread requests and output safety state sequences.",
      attachmentUrl: "/uploads/assignment1_deadlock_spec.pdf",
      dueDate: new Date(Date.now() - 3 * 86400000), // 3 days ago
      maxMarks: 100,
    },
  });

  // Kiran's submission (Graded)
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assign1.id,
      studentId: studentPrimary.id,
      fileUrl: "/uploads/kiran_kumar_cs501_bankers_algo.zip",
      notes: "Implemented in modern C++17 with full safety verification testbench.",
      status: "GRADED",
      marks: 92,
      feedback: "Superb implementation. Clean edge case handling for ungranted resource safety checks.",
      gradedAt: new Date(),
    },
  });

  // Assignment 2: Open / Active
  await prisma.assignment.create({
    data: {
      courseId: createdCourses[1].id, // CS502
      facultyId: createdCourses[1].facultyProfileId,
      title: "B+ Tree Indexing Node Splitting & Disk Page Layout",
      description: "Design a disk-backed B+ tree index structure that supports fast point queries and range scans with concurrency locks.",
      attachmentUrl: "/uploads/assignment2_bplus_tree.pdf",
      dueDate: new Date(Date.now() + 4 * 86400000), // In 4 days
      maxMarks: 100,
    },
  });

  // Assignment 3: Due Soon
  await prisma.assignment.create({
    data: {
      courseId: createdCourses[2].id, // CS503
      facultyId: createdCourses[2].facultyProfileId,
      title: "Wireshark Packet Capture & TCP 3-Way Handshake Analysis",
      description: "Capture real-time network traffic during an HTTP/HTTPS request, isolate the TCP connection handshake, and analyze window sizing.",
      attachmentUrl: "/uploads/assignment3_wireshark_lab.pdf",
      dueDate: new Date(Date.now() + 1 * 86400000), // Tomorrow
      maxMarks: 50,
    },
  });

  // 10. Fee Invoices & Payment Transactions
  console.log("Creating fee invoices & transaction receipts...");
  // Tuition: Paid
  const invTuition = await prisma.feeInvoice.create({
    data: {
      studentId: studentPrimary.id,
      feeType: "TUITION",
      title: "Academic Tuition Fee — Semester 5",
      amount: 65000,
      dueDate: new Date("2026-08-31"),
      status: "PAID",
      receiptNumber: "REC-2024-8841",
      paidAt: new Date("2026-08-20"),
      paymentMethod: "NETBANKING",
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      invoiceId: invTuition.id,
      amount: 65000,
      gatewayRef: "MOCK-TXN-TUITION-934812",
      status: "SUCCESS",
      paymentMethod: "NETBANKING",
    },
  });

  // Exam: Paid
  const invExam = await prisma.feeInvoice.create({
    data: {
      studentId: studentPrimary.id,
      feeType: "EXAM",
      title: "University Semester 5 Examination Fee",
      amount: 2500,
      dueDate: new Date("2026-09-15"),
      status: "PAID",
      receiptNumber: "REC-2024-9120",
      paidAt: new Date("2026-09-10"),
      paymentMethod: "UPI",
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      invoiceId: invExam.id,
      amount: 2500,
      gatewayRef: "MOCK-TXN-EXAM-110294",
      status: "SUCCESS",
      paymentMethod: "UPI",
    },
  });

  // Hostel: PENDING (Ready to test mock payment gateway!)
  await prisma.feeInvoice.create({
    data: {
      studentId: studentPrimary.id,
      feeType: "HOSTEL",
      title: "Hostel Accommodation & Mess Fee — Term 1",
      amount: 42000,
      dueDate: new Date(Date.now() + 10 * 86400000), // in 10 days
      status: "PENDING",
    },
  });

  // Library: Paid
  await prisma.feeInvoice.create({
    data: {
      studentId: studentPrimary.id,
      feeType: "LIBRARY",
      title: "Central Library Access & Caution Deposit",
      amount: 1500,
      dueDate: new Date("2026-08-15"),
      status: "PAID",
      receiptNumber: "REC-2024-4102",
      paidAt: new Date("2026-08-12"),
      paymentMethod: "CARD",
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("-----------------------------------------");
  console.log("DEMO ACCOUNTS READY TO TEST:");
  console.log("1. Student:   student@college.edu      / Student@123");
  console.log("2. Faculty:   faculty@college.edu      / Faculty@123");
  console.log("3. Admin:     admin@college.edu        / Admin@123");
  console.log("4. Recruiter: recruiter@college.edu    / Recruiter@123");
  console.log("5. Alumni:    alumni@college.edu       / Alumni@123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
