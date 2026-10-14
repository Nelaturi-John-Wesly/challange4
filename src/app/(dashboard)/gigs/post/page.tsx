"use client";

import { GigsNav } from "@/components/gigs/GigsNav";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { containsProhibitedFeeKeywords, GigCategory, GigLocation, GigRewardType, useAppStore } from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Coins,
  FileCheck2,
  HelpCircle,
  Info,
  MapPin,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const CATEGORIES: GigCategory[] = [
  "Teaching/Tutoring",
  "Events Help",
  "Lab/Research Assistance",
  "Design/Content",
  "Data Entry/Documentation",
  "Tech/Coding",
  "Errands/Campus Help",
  "Other",
];

const REWARD_TYPES: { type: GigRewardType; label: string; desc: string }[] = [
  { type: "CASH", label: "Direct Cash Stipend", desc: "Paid directly to student upon work approval (INR)" },
  { type: "CANTEEN_COUPON", label: "Canteen Food Tokens", desc: "Redeemable meal tokens at campus cafeterias" },
  { type: "CERTIFICATE", label: "Official Practicum Certificate", desc: "Department-signed credential for resume/portfolio" },
  { type: "VOLUNTEER_HOURS", label: "Volunteer / CSR Hours", desc: "Accredited extracurricular activity hours" },
  { type: "OTHER", label: "Other Mutual Exchange", desc: "Mentorship, book exchange, or workshop access" },
];

export default function PostGigPage() {
  const router = useRouter();
  const store = useAppStore();
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role || "STUDENT";

  // Step state: 1 (Basics) -> 2 (Reward & Slots) -> 3 (Skills & Location) -> 4 (Preview)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GigCategory>("Tech/Coding");
  const [rewardType, setRewardType] = useState<GigRewardType>("CASH");
  const [rewardAmount, setRewardAmount] = useState<number | "">(1500);
  const [rewardDescription, setRewardDescription] = useState("");
  const [numberOfSlots, setNumberOfSlots] = useState<number>(1);
  const [deadline, setDeadline] = useState("2026-10-30T18:00");
  const [estimatedHours, setEstimatedHours] = useState<number>(6);
  const [location, setLocation] = useState<GigLocation>("On-campus");
  const [locationDetails, setLocationDetails] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(["Communication", "Problem Solving"]);
  const [attachmentLink, setAttachmentLink] = useState("");

  // Restore Draft from LocalStorage if available
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("campus_gig_post_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.rewardType) setRewardType(parsed.rewardType);
        if (parsed.rewardAmount !== undefined) setRewardAmount(parsed.rewardAmount);
        if (parsed.rewardDescription) setRewardDescription(parsed.rewardDescription);
        if (parsed.numberOfSlots) setNumberOfSlots(parsed.numberOfSlots);
        if (parsed.deadline) setDeadline(parsed.deadline);
        if (parsed.estimatedHours) setEstimatedHours(parsed.estimatedHours);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.locationDetails) setLocationDetails(parsed.locationDetails);
        if (parsed.skills?.length) setSkills(parsed.skills);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSaveDraft = () => {
    try {
      const draftData = {
        title,
        description,
        category,
        rewardType,
        rewardAmount,
        rewardDescription,
        numberOfSlots,
        deadline,
        estimatedHours,
        location,
        locationDetails,
        skills,
      };
      localStorage.setItem("campus_gig_post_draft", JSON.stringify(draftData));
      toast({
        title: "Draft Stored Locally",
        description: "Your task progress has been saved. You can resume anytime.",
        variant: "info",
      });
    } catch {
      toast({ title: "Could not save draft", variant: "error" });
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const clean = skillInput.trim().replace(/^,+|,+$/g, "");
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!title.trim() || title.length < 5) {
        toast({ title: "Title Too Short", description: "Please enter a descriptive title (min 5 chars).", variant: "warning" });
        return false;
      }
      if (!description.trim() || description.length < 20) {
        toast({ title: "Detailed Description Required", description: "Describe the tasks, requirements, or deliverables (min 20 chars).", variant: "warning" });
        return false;
      }
      if (containsProhibitedFeeKeywords(`${title} ${description}`)) {
        toast({
          title: "Anti-Scam Violation",
          description: "Gigs asking students to pay an upfront fee or deposit are prohibited.",
          variant: "error",
        });
        return false;
      }
    }
    if (step === 2) {
      if (!rewardDescription.trim()) {
        toast({ title: "Reward Description Required", description: "Explain what the student receives upon completion.", variant: "warning" });
        return false;
      }
      if (rewardType === "CASH" && (!rewardAmount || Number(rewardAmount) <= 0)) {
        toast({ title: "Valid Cash Amount Required", description: "Please specify a positive stipend amount in INR.", variant: "warning" });
        return false;
      }
      if (!deadline) {
        toast({ title: "Deadline Required", description: "Set an application deadline date and time.", variant: "warning" });
        return false;
      }
      if (new Date(deadline).getTime() <= Date.now()) {
        toast({ title: "Invalid Deadline", description: "Deadline must be in the future.", variant: "warning" });
        return false;
      }
    }
    if (step === 3) {
      if (skills.length === 0) {
        toast({ title: "At least one skill tag required", description: "Add at least 1 skill required for the task.", variant: "warning" });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1) as any);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const result = store.createGig({
      title,
      description,
      category,
      postedBy: {
        id: user?.id || `usr-${Date.now()}`,
        name: user?.name || "Campus Poster",
        role: (user?.role as any) || "STUDENT",
        department: (user as any)?.departmentCode || "CAMPUS",
        verified: userRole !== "STUDENT",
        avatar: user?.avatar || undefined,
      },
      rewardType,
      rewardAmount: rewardType === "CASH" ? Number(rewardAmount) : undefined,
      rewardDescription,
      numberOfSlots: Number(numberOfSlots),
      deadline: new Date(deadline).toISOString(),
      estimatedHours: Number(estimatedHours),
      location,
      locationDetails: locationDetails || undefined,
      requiredSkills: skills,
      attachments: attachmentLink ? [{ name: "Resource Link", url: attachmentLink }] : undefined,
    });

    if (result.success && result.gig) {
      try {
        localStorage.removeItem("campus_gig_post_draft");
      } catch {}

      if (userRole === "STUDENT") {
        toast({
          title: "Gig Submitted for Admin Approval! ⏳",
          description: "Student-posted gigs must be verified by campus administration before appearing live.",
          variant: "info",
        });
        router.push("/gigs/my-gigs");
      } else {
        toast({
          title: "Campus Gig Published Live! 🎉",
          description: "Your task is now live on the Gig Board and accepting student applicants.",
          variant: "success",
        });
        router.push(`/gigs/${result.gig.id}`);
      }
    } else {
      toast({
        title: "Could not create gig",
        description: result.error || "An error occurred.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 text-left">
      {/* Top Nav */}
      <GigsNav userRole={userRole} userName={user?.name || undefined} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/gigs"
            className="text-xs font-semibold text-slate-500 hover:text-amber-500 flex items-center gap-1.5 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel and return</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Create a Campus Gig</span>
            <Badge variant="warning" className="text-[10px]">
              {userRole === "STUDENT" ? "Student Request" : "Verified Poster"}
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Post an academic tutorial, event coordination help, lab task, or digital assistance for students.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleSaveDraft}
          className="gap-1.5 self-start sm:self-auto text-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Draft</span>
        </Button>
      </div>

      {/* Role Notice Banner */}
      {userRole === "STUDENT" ? (
        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-sky-500 shrink-0" />
          <span>
            <b>Student Notice:</b> As a student, your task will be reviewed by campus administrators
            before going live to ensure academic compliance and fair rewards.
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <b>Verified Staff/Club Lead:</b> Your task will publish <b>instantly</b> on the campus Gig Board
            with a Verified badge.
          </span>
        </div>
      )}

      {/* Multi-step Stepper Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { step: 1, label: "1. Task Basics" },
          { step: 2, label: "2. Reward & Time" },
          { step: 3, label: "3. Skills & Location" },
          { step: 4, label: "4. Review & Post" },
        ].map((s) => (
          <div
            key={s.step}
            onClick={() => {
              if (s.step < currentStep) setCurrentStep(s.step as any);
            }}
            className={cn(
              "p-2.5 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer",
              currentStep === s.step
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20"
                : currentStep > s.step
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
            )}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Task Basics */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Step 1: Task Overview & Classification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Give your task an engaging title and a comprehensive scope of work.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Gig Title <span className="text-amber-500">*</span></span>
                  <span className="text-[10px] text-slate-400">{title.length}/100</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g., Python Lab Teaching Assistant (Data Structures)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Category <span className="text-amber-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "p-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer",
                        category === cat
                          ? "bg-amber-500/10 border-amber-500 text-amber-500 dark:text-amber-400 font-bold"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Detailed Description & Responsibilities <span className="text-amber-500">*</span></span>
                  <span className="text-[10px] text-slate-400">Min 20 characters</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="Explain what the student will be doing, expectations, schedule, and expected deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Reward, Slots & Deadline */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Step 2: Rewards, Slots & Timeline
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define the compensation or incentive structure and set an application deadline.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Reward Type <span className="text-amber-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {REWARD_TYPES.map((rt) => (
                    <div
                      key={rt.type}
                      onClick={() => setRewardType(rt.type)}
                      className={cn(
                        "p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3",
                        rewardType === rt.type
                          ? "bg-amber-500/10 border-amber-500 text-slate-900 dark:text-slate-100"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                      )}
                    >
                      <input
                        type="radio"
                        checked={rewardType === rt.type}
                        onChange={() => setRewardType(rt.type)}
                        className="mt-1 accent-amber-500"
                      />
                      <div>
                        <div className="font-bold text-xs">{rt.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{rt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {rewardType === "CASH" && (
                <div className="space-y-1.5 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Stipend Amount (INR ₹) <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={50}
                    placeholder="1500"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Stipend will be credited directly to the student upon work verification.
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Reward Details / Terms <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., ₹1,800 direct stipend + Faculty recommendation note"
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Number of Student Slots <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={numberOfSlots}
                    onChange={(e) => setNumberOfSlots(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Estimated Commitment <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold"
                  />
                  <span className="text-[10px] text-slate-400">Total hours (Max 15h)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Application Deadline <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Skills & Location */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Step 3: Skills, Location & Resources
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tag the essential skills and specify where the task will be conducted.
              </p>
            </div>

            <div className="space-y-4">
              {/* Location Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Location Type <span className="text-amber-500">*</span>
                </label>
                <div className="flex gap-3">
                  {(["On-campus", "Remote"] as const).map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className={cn(
                        "flex-1 p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer",
                        location === loc
                          ? "bg-amber-500/10 border-amber-500 text-amber-500 dark:text-amber-400"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                      )}
                    >
                      {loc === "On-campus" ? "📍 On-Campus Facility" : "💻 Remote / Online"}
                    </button>
                  ))}
                </div>
              </div>

              {location === "On-campus" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Campus Hall / Room / Lab Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Turing Lab 302, Computing Block"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Online Submission Channel
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., GitHub Pull Request / Google Drive / Figma Link"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              {/* Skills Tags Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Required Skills & Tags <span className="text-amber-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a skill (e.g. Python, Canva, Sound Mixing) and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddSkill}>
                    Add Tag
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1.5"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-amber-300 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Optional Reference Link */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Optional Reference Link / Syllabus / Brief (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or GitHub link"
                  value={attachmentLink}
                  onChange={(e) => setAttachmentLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Preview & Publish */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Step 4: Final Preview & Verification
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect how your task will appear on the campus Gig Board before submitting.
                </p>
              </div>
              <Badge variant="warning">Preview Mode</Badge>
            </div>

            {/* Preview Card Mockup */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {category}
                </span>
                <Badge variant={rewardType === "CASH" ? "success" : "info"} className="font-bold">
                  {rewardType === "CASH" ? `₹${rewardAmount}` : rewardType.replace("_", " ")}
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Reward: </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{rewardDescription}</span>
                </div>
                <div>
                  <span className="text-slate-400">Slots: </span>
                  <span className="font-bold text-emerald-500">{numberOfSlots} Available</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>📍 {location} {locationDetails ? `(${locationDetails})` : ""}</span>
                <span>⏱️ {estimatedHours} hours total</span>
                <span>📅 Deadline: {new Date(deadline).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Anti-Scam Assurance */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>
                <b>Academic Integrity Compliance:</b> This task complies with zero student registration fees.
                Student applications will be routed directly to your portal.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as any)}
              className="gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
              className="gap-1.5 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              className="gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{userRole === "STUDENT" ? "Submit for Approval" : "Publish Live Now"}</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
