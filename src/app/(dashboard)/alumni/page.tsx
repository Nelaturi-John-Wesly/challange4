"use client";

import { ModalForm } from "@/components/shared/ModalForm";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface Alumnus {
  id: string;
  name: string;
  batch: string;
  department: string;
  role: string;
  company: string;
  location: string;
  avatar: string;
  mentorshipTopics: string[];
  linkedin: string;
  bio: string;
}

const ALUMNI_DIRECTORY: Alumnus[] = [
  {
    id: "alm-1",
    name: "Vikramaditya Rao",
    batch: "2018",
    department: "Computer Science",
    role: "Founder & CEO",
    company: "PayFlow Technologies ($120M Val)",
    location: "Bengaluru, India",
    avatar: "VR",
    mentorshipTopics: ["Seed Fundraising", "Startup PMF", "FinTech"],
    linkedin: "https://linkedin.com/in/vikramaditya-rao",
    bio: "Ex-Stripe engineer. Built PayFlow from scratch. Passionate about mentoring undergraduate founders on enterprise B2B sales.",
  },
  {
    id: "alm-2",
    name: "Dr. Meera Swaminathan",
    batch: "2016",
    department: "Electronics & Communication",
    role: "Senior Research Scientist",
    company: "Google DeepMind",
    location: "London, UK",
    avatar: "MS",
    mentorshipTopics: ["PhD Applications Abroad", "Edge AI", "Computer Vision"],
    linkedin: "https://linkedin.com/in/meera-swaminathan",
    bio: "Completed PhD at Cambridge. Researches multimodal perception and efficient transformers. Open for 1-on-1 research mentorship.",
  },
  {
    id: "alm-3",
    name: "Arjun Nambiar",
    batch: "2020",
    department: "Information Technology",
    role: "Staff Software Engineer",
    company: "Microsoft Azure",
    location: "Redmond, WA, USA",
    avatar: "AN",
    mentorshipTopics: ["System Design", "Cloud Infrastructure", "FAANG Interviews"],
    linkedin: "https://linkedin.com/in/arjun-nambiar",
    bio: "Helps final-year students navigate distributed system design, LeetCode strategies, and US tech visa pathways.",
  },
  {
    id: "alm-4",
    name: "Pooja Hegde",
    batch: "2019",
    department: "Mechanical Engineering",
    role: "Engagement Manager",
    company: "McKinsey & Company",
    location: "Mumbai, India",
    avatar: "PH",
    mentorshipTopics: ["Management Consulting", "CAT & GMAT Prep", "ISB / IIM"],
    linkedin: "https://linkedin.com/in/pooja-hegde",
    bio: "IIM Ahmedabad Gold Medalist. Mentors students interested in strategic consulting, case interviews, and management careers.",
  },
];

export default function AlumniPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");

  const [selectedAlum, setSelectedAlum] = useState<Alumnus | null>(null);
  const [mentorshipTopic, setMentorshipTopic] = useState("");
  const [mentorshipNote, setMentorshipNote] = useState("");

  const filteredAlumni = useMemo(() => {
    return ALUMNI_DIRECTORY.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.mentorshipTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCompany = companyFilter === "All" || a.company.includes(companyFilter);
      return matchSearch && matchCompany;
    });
  }, [searchQuery, companyFilter]);

  const handleMentorshipRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlum) return;

    toast({
      title: "Mentorship Request Sent!",
      description: `Your request was delivered to ${selectedAlum.name}. They will reach out via college email.`,
      variant: "success",
    });

    setSelectedAlum(null);
    setMentorshipTopic("");
    setMentorshipNote("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <GraduationCap className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Alumni Global Directory & Mentorship
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Connect with distinguished graduates leading global tech giants, venture capital, and research labs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold">
            18,400+ Alumni Worldwide
          </Badge>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search alumni by name, company, topic (e.g. AI, Stanford)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Company:</span>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="All">All Organizations</option>
            <option value="Google">Google / DeepMind</option>
            <option value="Microsoft">Microsoft</option>
            <option value="PayFlow">PayFlow (Startups)</option>
            <option value="McKinsey">McKinsey</option>
          </select>
        </div>
      </div>

      {/* Alumni Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlumni.map((alum) => (
          <div
            key={alum.id}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-base flex items-center justify-center shadow-md">
                  {alum.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {alum.name}
                  </h3>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {alum.role} • {alum.company}
                  </p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Class of {alum.batch} ({alum.department})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate max-w-[120px]">{alum.location}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              "{alum.bio}"
            </p>

            {/* Mentorship Badges */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Mentorship Tracks:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {alum.mentorshipTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-semibold"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <a
                href={alum.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-500 hover:text-amber-500 flex items-center gap-1 font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Profile
              </a>

              <button
                onClick={() => setSelectedAlum(alum)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Request 1-on-1 Mentorship
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mentorship Request Modal */}
      <ModalForm
        isOpen={!!selectedAlum}
        onClose={() => setSelectedAlum(null)}
        title={`Request Mentorship with ${selectedAlum?.name || ""}`}
        description={`${selectedAlum?.role || ""} at ${selectedAlum?.company || ""}`}
      >
        {selectedAlum && (
          <form onSubmit={handleMentorshipRequest} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Select Discussion Topic *</label>
              <select
                required
                value={mentorshipTopic}
                onChange={(e) => setMentorshipTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              >
                <option value="">-- Choose Discussion Area --</option>
                {selectedAlum.mentorshipTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="General Career Guidance">General Career Guidance</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">
                Your Objective / Questions for the Session *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain what specific challenges or decisions you want advice on..."
                value={mentorshipNote}
                onChange={(e) => setMentorshipNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlum(null)}
                className="px-4 py-2 rounded-xl border text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
              >
                Send Mentorship Invitation
              </button>
            </div>
          </form>
        )}
      </ModalForm>
    </div>
  );
}
