import assert from "node:assert";
import test from "node:test";
import {
  normalizeCollegeName,
  validateCollegeInput,
  getCollegeInitials,
  hashString,
  getCollegeLogoConfig,
  generateCollegeSvg,
  COLLEGE_PALETTES,
} from "../src/lib/college";

test("College Name Normalization: trims, collapses whitespace, and handles edge cases", () => {
  assert.strictEqual(normalizeCollegeName("  ABC   College  "), "ABC College");
  assert.strictEqual(normalizeCollegeName("Narasaraopeta Engineering College"), "Narasaraopeta Engineering College");
  assert.strictEqual(normalizeCollegeName(""), "");
});

test("College Input Validation: enforces required rules and blocks abusive characters", () => {
  // 1. Valid registration input
  const valid = validateCollegeInput({
    name: "Narasaraopeta Engineering College",
    city: "Narasaraopet",
    state: "Andhra Pradesh",
  });
  assert.strictEqual(valid.valid, true);
  assert.strictEqual(valid.error, undefined);

  // 2. Reject too short (<3 chars)
  const tooShort = validateCollegeInput({
    name: "AB",
    city: "Delhi",
    state: "Delhi",
  });
  assert.strictEqual(tooShort.valid, false);
  assert.ok(tooShort.error?.includes("at least 3 characters"));

  // 3. Reject malicious characters in name
  const malicious = validateCollegeInput({
    name: "Hacker <script>alert(1)</script>",
    city: "Bangalore",
    state: "Karnataka",
  });
  assert.strictEqual(malicious.valid, false);
  assert.ok(malicious.error?.includes("invalid special characters"));

  // 4. Reject missing or numerical city
  const invalidCity = validateCollegeInput({
    name: "Stanford University",
    city: "Stanford123",
    state: "California",
  });
  assert.strictEqual(invalidCity.valid, false);
  assert.ok(invalidCity.error?.includes("City should not contain numbers"));

  // 5. Reject missing state
  const missingState = validateCollegeInput({
    name: "IIT Madras",
    city: "Chennai",
    state: "",
  });
  assert.strictEqual(missingState.valid, false);
  assert.ok(missingState.error?.includes("State is required"));
});

test("College Initials Derivation: extracts smart academic acronyms", () => {
  // Narasaraopeta Engineering College -> NEC
  assert.strictEqual(getCollegeInitials("Narasaraopeta Engineering College"), "NEC");

  // Indian Institute of Technology Madras -> IITM (ignores "of")
  assert.strictEqual(getCollegeInitials("Indian Institute of Technology Madras"), "IITM");

  // Delhi Technological University -> DTU
  assert.strictEqual(getCollegeInitials("Delhi Technological University"), "DTU");

  // BITS Pilani -> BP
  assert.strictEqual(getCollegeInitials("BITS Pilani"), "BP");

  // Single word
  assert.strictEqual(getCollegeInitials("Harvard"), "HAR");

  // Empty fallback
  assert.strictEqual(getCollegeInitials(""), "COL");
});

test("Deterministic Hashing: ensures consistent logo generation across sessions", () => {
  const name1 = "Narasaraopeta Engineering College";
  const name2 = "narasaraopeta engineering college "; // case + trailing whitespace
  
  const hash1 = hashString(name1);
  const hash2 = hashString(name2);

  // Consistent hashing across casing and spaces
  assert.strictEqual(hash1, hash2, "Hashing must be case-insensitive and trimmed");

  // Different colleges yield different hashes
  const hashDiff = hashString("IIT Madras");
  assert.notStrictEqual(hash1, hashDiff, "Different colleges must have different hashes");

  // Config repeatability
  const configA = getCollegeLogoConfig(name1);
  const configB = getCollegeLogoConfig(name1);
  assert.deepStrictEqual(configA, configB, "Config must be 100% deterministic");
});

test("Deterministic SVG Generation: produces accessible, scalable vector graphics", () => {
  const collegeName = "Delhi Technological University";
  const svg = generateCollegeSvg(collegeName);

  // Valid SVG output check
  assert.ok(svg.startsWith("<svg"), "Must start with <svg root element");
  assert.ok(svg.includes('role="img"'), "Must be accessible with role='img'");
  assert.ok(svg.includes(`aria-label="${collegeName} Logo"`), "Must include aria-label with college name");
  assert.ok(svg.includes("DTU"), "Must display the derived initials DTU");
  assert.ok(svg.includes("linearGradient"), "Must include SVG gradient styling");

  // Custom theme color override test
  const customHex = "#ff007f";
  const customSvg = generateCollegeSvg(collegeName, customHex);
  assert.ok(customSvg.includes(customHex), "Custom college theme color must be incorporated into SVG");
});

test("Palette selection: all 8 curated futuristic palettes are valid", () => {
  assert.strictEqual(COLLEGE_PALETTES.length, 8);
  for (const palette of COLLEGE_PALETTES) {
    assert.ok(palette.primary.startsWith("#"), "Primary color must be hex code");
    assert.ok(palette.secondary.startsWith("#"), "Secondary color must be hex code");
    assert.ok(palette.accent.startsWith("#"), "Accent color must be hex code");
  }
});
