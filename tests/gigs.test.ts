import assert from "node:assert";
import test from "node:test";
import {
  calculateSkillMatch,
  containsProhibitedFeeKeywords,
  MAX_ACTIVE_GIGS_PER_STUDENT,
  MAX_WEEKLY_HOURS_PER_STUDENT,
} from "../src/lib/gigs";
import { globalStore } from "../src/lib/store";

test("Campus Gigs Safety Rules: Anti-Scam Upfront Fee Detection", () => {
  // Prohibited postings
  assert.strictEqual(
    containsProhibitedFeeKeywords("Pay an application fee of 500 to join our event team"),
    true,
    "Should detect 'application fee'"
  );
  assert.strictEqual(
    containsProhibitedFeeKeywords("Security deposit required for lab equipment access"),
    true,
    "Should detect 'security deposit'"
  );
  assert.strictEqual(
    containsProhibitedFeeKeywords("Deposit money before receiving the assignment"),
    true,
    "Should detect 'deposit money'"
  );

  // Legitimate postings
  assert.strictEqual(
    containsProhibitedFeeKeywords("Help 2nd-year students with binary tree lab sessions. ₹1,800 stipend provided."),
    false,
    "Legitimate stipend gig should pass"
  );
});

test("Campus Gigs Work-Study Balance: Weekly Hours & Active Task Limits", () => {
  const studentWeeklyHours = 12;
  const newGigHours = 4;

  const exceedsWeeklyCap = studentWeeklyHours + newGigHours > MAX_WEEKLY_HOURS_PER_STUDENT;
  assert.strictEqual(exceedsWeeklyCap, true, "12 + 4 exceeds 15 hours/week academic cap");

  const activeGigsCount = 3;
  const canApplyMore = activeGigsCount < MAX_ACTIVE_GIGS_PER_STUDENT;
  assert.strictEqual(canApplyMore, false, "Cannot exceed 3 active concurrent gigs");
});

test("Campus Gigs Matching: Skill overlap score calculation", () => {
  const studentSkills = ["Python", "DSA", "Problem Solving", "React"];
  const gigSkillsA = ["Python", "DSA", "Lab Mentoring"];

  // Matches: Python, DSA (2 of 3 = 67%)
  const scoreA = calculateSkillMatch(studentSkills, gigSkillsA);
  assert.strictEqual(scoreA, 67);

  const gigSkillsB = ["Rust", "Solidity"];
  const scoreB = calculateSkillMatch(studentSkills, gigSkillsB);
  assert.strictEqual(scoreB, 0);

  const gigSkillsEmpty: string[] = [];
  const scoreEmpty = calculateSkillMatch(studentSkills, gigSkillsEmpty);
  assert.strictEqual(scoreEmpty, 100);
});

test("Campus Gigs Workflow: Application, Work Submission, and Escrow Reward Settlement", () => {
  const studentId = "usr-test-student";
  const studentName = "Test Student";
  const gigId = "gig-1";

  // 1. Submit Application
  const applyRes = globalStore.applyToGig({
    gigId,
    studentId,
    studentName,
    studentDept: "CSE",
    studentYear: 3,
    studentRating: 5.0,
    message: "Qualified Python tutor with past TA experience.",
  });

  assert.strictEqual(applyRes.success, true);

  // 2. Prevent duplicate application
  const dupRes = globalStore.applyToGig({
    gigId,
    studentId,
    studentName,
    message: "Duplicate attempt",
  });
  assert.strictEqual(dupRes.success, false);
  assert.strictEqual(dupRes.error, "You have already applied to this gig.");

  // 3. Find created application
  const app = globalStore.gigApplications.find((a) => a.gigId === gigId && a.studentId === studentId);
  assert.ok(app);

  // 4. Accept applicant
  globalStore.acceptApplicant(app.id);
  const updatedApp = globalStore.gigApplications.find((a) => a.id === app.id);
  assert.strictEqual(updatedApp?.status, "ACCEPTED");

  // 5. Submit Work
  globalStore.submitGigWork({
    gigId,
    studentId,
    studentName,
    notes: "Conducted 4 weekly lab tutorials and submitted attendance grading sheet.",
    filesOrLinks: [{ title: "Lab Sheet", url: "https://example.com/sheet" }],
  });
  const sub = globalStore.gigSubmissions.find((s) => s.gigId === gigId && s.studentId === studentId);
  assert.ok(sub);
  assert.strictEqual(sub.status, "SUBMITTED");

  // 6. Review & Approve Work -> Triggers Reward Transaction
  globalStore.reviewSubmission({
    submissionId: sub.id,
    decision: "APPROVED",
  });

  const tx = globalStore.gigTransactions.find((t) => t.gigId === gigId && t.studentId === studentId);
  assert.ok(tx);
  assert.strictEqual(tx.posterConfirmed, true);

  // 7. Student Confirms Receipt
  globalStore.confirmStudentReceipt(tx.id);
  const settledTx = globalStore.gigTransactions.find((t) => t.id === tx.id);
  assert.strictEqual(settledTx?.studentConfirmed, true);
  assert.strictEqual(settledTx?.status, "RECEIVED");
});
