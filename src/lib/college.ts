/**
 * College Identity & Deterministic Logo Engine
 * Generates unique, persistent, offline SVG logos and accent themes for any college name.
 */

export interface CollegeLogoConfig {
  initials: string;
  shape: "shield" | "hexagon" | "circle" | "diamond";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  emblem: "book" | "torch" | "atom" | "grad" | "laurel" | "tech";
  gradientId: string;
}

// 8 Curated Futuristic Campus Palettes
export const COLLEGE_PALETTES = [
  {
    name: "Electric Amber",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
    bgDark: "from-amber-600 to-orange-700",
  },
  {
    name: "Cyber Violet",
    primary: "#8b5cf6",
    secondary: "#6366f1",
    accent: "#a78bfa",
    bgDark: "from-violet-600 to-indigo-800",
  },
  {
    name: "Emerald Matrix",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    bgDark: "from-emerald-600 to-teal-800",
  },
  {
    name: "Neon Sky",
    primary: "#0ea5e9",
    secondary: "#0284c7",
    accent: "#38bdf8",
    bgDark: "from-sky-500 to-blue-700",
  },
  {
    name: "Crimson Rose",
    primary: "#f43f5e",
    secondary: "#e11d48",
    accent: "#fb7185",
    bgDark: "from-rose-500 to-pink-700",
  },
  {
    name: "Solar Orange",
    primary: "#ea580c",
    secondary: "#c2410c",
    accent: "#f97316",
    bgDark: "from-orange-500 to-red-700",
  },
  {
    name: "Electric Cyan",
    primary: "#06b6d4",
    secondary: "#0891b2",
    accent: "#22d3ee",
    bgDark: "from-cyan-500 to-teal-700",
  },
  {
    name: "Royal Purple",
    primary: "#9333ea",
    secondary: "#7e22ce",
    accent: "#c084fc",
    bgDark: "from-purple-600 to-fuchsia-800",
  },
];

/**
 * Normalizes college name for consistent matching & deduplication
 */
export function normalizeCollegeName(name: string): string {
  if (!name) return "";
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Validates college name and location fields
 */
export function validateCollegeInput(data: {
  name: string;
  city: string;
  state: string;
}): { valid: boolean; error?: string } {
  const normName = normalizeCollegeName(data.name);
  if (!normName || normName.length < 3) {
    return { valid: false, error: "College Name must be at least 3 characters long." };
  }
  if (normName.length > 120) {
    return { valid: false, error: "College Name cannot exceed 120 characters." };
  }
  // Disallow abusive special characters (<>{}[]$\/*)
  if (/[<>{}[\]$\\/*]/.test(normName)) {
    return { valid: false, error: "College Name contains invalid special characters." };
  }

  const city = data.city?.trim();
  if (!city || city.length < 2) {
    return { valid: false, error: "City is required (at least 2 characters)." };
  }
  if (/[<>{}[\]$\\/*0-9]/.test(city)) {
    return { valid: false, error: "City should not contain numbers or special symbols." };
  }

  const state = data.state?.trim();
  if (!state || state.length < 2) {
    return { valid: false, error: "State is required (at least 2 characters)." };
  }
  if (/[<>{}[\]$\\/*0-9]/.test(state)) {
    return { valid: false, error: "State should not contain numbers or special symbols." };
  }

  return { valid: true };
}

/**
 * Deterministic integer hash from string (DJB2)
 */
export function hashString(str: string): number {
  let hash = 5381;
  const clean = str.toLowerCase().trim();
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 33) ^ clean.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

/**
 * Derives college acronym/initials intelligently
 * e.g., "Narasaraopeta Engineering College" -> "NEC"
 * "Indian Institute of Technology Madras" -> "IITM"
 */
export function getCollegeInitials(name: string): string {
  const clean = normalizeCollegeName(name);
  if (!clean) return "COL";

  const stopWords = new Set(["of", "and", "&", "for", "in", "the", "at", "de"]);
  const parts = clean
    .split(/[\s\-–—/]+/)
    .filter((word) => word.length > 0 && !stopWords.has(word.toLowerCase()));

  if (parts.length === 0) return clean.slice(0, 3).toUpperCase();

  if (parts.length === 1) {
    return parts[0].slice(0, Math.min(3, parts[0].length)).toUpperCase();
  }

  if (parts.length === 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  if (parts.length === 3) {
    return (parts[0][0] + parts[1][0] + parts[2][0]).toUpperCase();
  }

  // 4 or more: take first 3 or 4
  return parts
    .slice(0, 4)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Computes deterministic logo parameters from college name
 */
export function getCollegeLogoConfig(collegeName: string, customThemeColor?: string | null): CollegeLogoConfig {
  const hash = hashString(collegeName || "Campus College");
  const initials = getCollegeInitials(collegeName);

  const shapes: CollegeLogoConfig["shape"][] = ["shield", "hexagon", "circle", "diamond"];
  const emblems: CollegeLogoConfig["emblem"][] = ["book", "torch", "atom", "grad", "laurel", "tech"];

  const shape = shapes[hash % shapes.length];
  const emblem = emblems[(hash >> 3) % emblems.length];

  const paletteIndex = hash % COLLEGE_PALETTES.length;
  const defaultPalette = COLLEGE_PALETTES[paletteIndex];

  const primaryColor = customThemeColor || defaultPalette.primary;
  const secondaryColor = defaultPalette.secondary;
  const accentColor = defaultPalette.accent;

  const safeId = "grad-" + (collegeName || "c").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toLowerCase() + "-" + (hash % 1000);

  return {
    initials,
    shape,
    primaryColor,
    secondaryColor,
    accentColor,
    emblem,
    gradientId: safeId,
  };
}

/**
 * Generates a complete standalone SVG markup for a college
 */
export function generateCollegeSvg(collegeName: string, customThemeColor?: string | null): string {
  const cfg = getCollegeLogoConfig(collegeName, customThemeColor);

  let shapeMarkup = "";
  if (cfg.shape === "shield") {
    shapeMarkup = `
      <path d="M 50 8 C 75 8, 92 12, 92 36 C 92 68, 64 88, 50 94 C 36 88, 8 68, 8 36 C 8 12, 25 8, 50 8 Z"
        fill="url(#${cfg.gradientId})" stroke="${cfg.accentColor}" stroke-width="2.5" />
    `;
  } else if (cfg.shape === "hexagon") {
    shapeMarkup = `
      <polygon points="50,6 90,28 90,72 50,94 10,72 10,28"
        fill="url(#${cfg.gradientId})" stroke="${cfg.accentColor}" stroke-width="2.5" stroke-linejoin="round" />
    `;
  } else if (cfg.shape === "diamond") {
    shapeMarkup = `
      <rect x="18" y="18" width="64" height="64" rx="14" transform="rotate(45 50 50)"
        fill="url(#${cfg.gradientId})" stroke="${cfg.accentColor}" stroke-width="2.5" />
    `;
  } else {
    // Circle with inner ring
    shapeMarkup = `
      <circle cx="50" cy="50" r="44" fill="url(#${cfg.gradientId})" stroke="${cfg.accentColor}" stroke-width="2.5" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="${cfg.accentColor}" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="3 3" />
    `;
  }

  // Emblem icon in upper half
  let emblemMarkup = "";
  if (cfg.emblem === "book") {
    emblemMarkup = `
      <path d="M 36 32 Q 50 28 50 36 Q 50 28 64 32 L 64 42 Q 50 38 50 46 Q 50 38 36 42 Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    `;
  } else if (cfg.emblem === "torch") {
    emblemMarkup = `
      <path d="M 50 24 C 54 28, 54 32, 50 35 C 46 32, 46 28, 50 24 Z" fill="#ffffff" />
      <path d="M 45 36 L 55 36 L 52 46 L 48 46 Z" fill="#ffffff" opacity="0.9" />
    `;
  } else if (cfg.emblem === "atom") {
    emblemMarkup = `
      <ellipse cx="50" cy="35" rx="12" ry="4.5" transform="rotate(30 50 35)" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.85" />
      <ellipse cx="50" cy="35" rx="12" ry="4.5" transform="rotate(-30 50 35)" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.85" />
      <circle cx="50" cy="35" r="2.2" fill="#ffffff" />
    `;
  } else if (cfg.emblem === "grad") {
    emblemMarkup = `
      <polygon points="50,26 66,32 50,38 34,32" fill="#ffffff" />
      <path d="M 40 35 L 40 42 Q 50 46 60 42 L 60 35" fill="none" stroke="#ffffff" stroke-width="1.8" />
    `;
  } else if (cfg.emblem === "tech") {
    emblemMarkup = `
      <circle cx="50" cy="28" r="2" fill="#ffffff" />
      <circle cx="40" cy="38" r="2" fill="#ffffff" />
      <circle cx="60" cy="38" r="2" fill="#ffffff" />
      <line x1="50" y1="28" x2="40" y2="38" stroke="#ffffff" stroke-width="1.5" />
      <line x1="50" y1="28" x2="60" y2="38" stroke="#ffffff" stroke-width="1.5" />
      <line x1="40" y1="38" x2="60" y2="38" stroke="#ffffff" stroke-width="1.5" />
    `;
  } else {
    // laurel
    emblemMarkup = `
      <path d="M 40 28 C 36 34, 38 42, 50 45 C 62 42, 64 34, 60 28" fill="none" stroke="#ffffff" stroke-width="1.8" />
      <circle cx="50" cy="30" r="2.5" fill="#ffffff" />
    `;
  }

  // Initials Font Size adjusted for length
  const fontSize = cfg.initials.length > 3 ? "20" : cfg.initials.length === 3 ? "24" : "28";
  const textY = cfg.emblem ? "66" : "58";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="${collegeName} Logo">
      <defs>
        <linearGradient id="${cfg.gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${cfg.primaryColor}" />
          <stop offset="100%" stop-color="${cfg.secondaryColor}" />
        </linearGradient>
        <filter id="glow-${cfg.gradientId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${cfg.primaryColor}" flood-opacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#glow-${cfg.gradientId})">
        ${shapeMarkup}
        ${emblemMarkup}
        <text x="50" y="${textY}" text-anchor="middle" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${fontSize}" fill="#ffffff" letter-spacing="0.5">
          ${cfg.initials}
        </text>
      </g>
    </svg>
  `.trim();
}
