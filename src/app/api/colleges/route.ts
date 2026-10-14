import { prisma } from "@/lib/prisma";
import {
  getCollegeLogoConfig,
  normalizeCollegeName,
  validateCollegeInput,
} from "@/lib/college";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Default fallback list of colleges for immediate display
const DEFAULT_COLLEGES = [
  {
    id: "col-nec",
    name: "Narasaraopeta Engineering College",
    city: "Narasaraopet",
    state: "Andhra Pradesh",
    country: "India",
    themeColor: "#f59e0b",
    logoSeed: "NEC",
  },
  {
    id: "col-iitm",
    name: "Indian Institute of Technology Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    themeColor: "#0ea5e9",
    logoSeed: "IITM",
  },
  {
    id: "col-dtu",
    name: "Delhi Technological University",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    themeColor: "#8b5cf6",
    logoSeed: "DTU",
  },
  {
    id: "col-nitk",
    name: "National Institute of Technology Karnataka",
    city: "Surathkal",
    state: "Karnataka",
    country: "India",
    themeColor: "#10b981",
    logoSeed: "NITK",
  },
  {
    id: "col-bits",
    name: "BITS Pilani",
    city: "Pilani",
    state: "Rajasthan",
    country: "India",
    themeColor: "#f43f5e",
    logoSeed: "BP",
  },
];

// GET /api/colleges?q=searchterm
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    let colleges: any[] = [];
    try {
      if (query && query.length > 0) {
        colleges = await prisma.college.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { city: { contains: query } },
              { state: { contains: query } },
            ],
          },
          orderBy: { name: "asc" },
          take: 20,
        });
      } else {
        colleges = await prisma.college.findMany({
          orderBy: { name: "asc" },
          take: 50,
        });
      }
    } catch (dbErr) {
      console.warn("Database lookup failed, returning default colleges:", dbErr);
    }

    if (!colleges || colleges.length === 0) {
      if (query) {
        const filtered = DEFAULT_COLLEGES.filter((c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.city.toLowerCase().includes(query.toLowerCase()) ||
          c.state.toLowerCase().includes(query.toLowerCase())
        );
        return NextResponse.json({ colleges: filtered });
      }
      return NextResponse.json({ colleges: DEFAULT_COLLEGES });
    }

    return NextResponse.json({ colleges });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch colleges", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/colleges (Create new college)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, city, state, country = "India" } = body;

    const validation = validateCollegeInput({ name, city, state });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanName = normalizeCollegeName(name);
    const cleanCity = city.trim();
    const cleanState = state.trim();
    const cleanCountry = (country || "India").trim();

    // Check case-insensitive duplicate match
    let existingCollege = null;
    try {
      // In SQLite, findUnique or findFirst
      const allColleges = await prisma.college.findMany({
        select: { id: true, name: true, city: true, state: true, themeColor: true, logoUrl: true },
      });
      existingCollege = allColleges.find(
        (c) => c.name.toLowerCase().trim() === cleanName.toLowerCase().trim()
      );
    } catch (e) {
      console.warn("Error checking existing college:", e);
    }

    if (existingCollege) {
      return NextResponse.json(
        {
          success: true,
          message: "College already exists. Selected existing college.",
          college: existingCollege,
          isExisting: true,
        },
        { status: 200 }
      );
    }

    // Generate deterministic logo configuration & theme color
    const logoCfg = getCollegeLogoConfig(cleanName);

    const createdCollege = await prisma.college.create({
      data: {
        name: cleanName,
        city: cleanCity,
        state: cleanState,
        country: cleanCountry,
        themeColor: logoCfg.primaryColor,
        logoSeed: logoCfg.initials,
        isVerified: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "New college registered successfully with custom generated seal!",
        college: createdCollege,
        isExisting: false,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating college:", err);
    return NextResponse.json(
      { error: "Could not create college.", details: err?.message },
      { status: 500 }
    );
  }
}
