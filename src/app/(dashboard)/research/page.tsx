"use client";

import { ModalForm } from "@/components/shared/ModalForm";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Award,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  Microscope,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  facultyAdvisor: string;
  domain: "Artificial Intelligence" | "VLSI & Embedded" | "Renewable Energy" | "Bioinformatics";
  venue: string; // e.g. IEEE Transactions, ACM SIGCOMM, Nature Communications
  year: number;
  citations: number;
  abstract: string;
  doi: string;
  pdfUrl?: string;
  hasOpenPositions: boolean;
}

const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: "res-1",
    title: "Low-Power Transformer Quantization for Autonomous Aerial Micro-Robotics",
    authors: ["Ananya Reddy", "Dr. Arvind Narayanan", "Vikram Sen"],
    facultyAdvisor: "Dr. Arvind Narayanan (Director, Autonomous Systems Lab)",
    domain: "Artificial Intelligence",
    venue: "IEEE Transactions on Robotics (T-RO)",
    year: 2026,
    citations: 28,
    doi: "10.1109/TRO.2026.849201",
    abstract: "We introduce a sub-8-bit quantization framework tailored for vision transformers executing on edge ARM Cortex and RISC-V coprocessors, reducing inference latency by 4.2x under strict 15W thermal envelopes.",
    hasOpenPositions: true,
  },
  {
    id: "res-2",
    title: "GaN-based High-Efficiency Power Inverters for Campus Micro-Grids",
    authors: ["Karthik Varma", "Dr. S. Prakash", "Sneha Rao"],
    facultyAdvisor: "Dr. S. Prakash (Department of Electrical Engineering)",
    domain: "Renewable Energy",
    venue: "Nature Clean Energy",
    year: 2025,
    citations: 45,
    doi: "10.1038/s41560-025-01429-1",
    abstract: "Experimental evaluation of Gallium Nitride (GaN) switching topology achieving 99.1% power conversion efficiency under dynamic solar irradiance variations in central campus rooftop arrays.",
    hasOpenPositions: false,
  },
  {
    id: "res-3",
    title: "Cryogenic CMOS Readout Circuitry for Scalable Silicon Spin Qubits",
    authors: ["Rohan Das", "Dr. K. Swaminathan"],
    facultyAdvisor: "Dr. K. Swaminathan (Quantum Hardware Lab)",
    domain: "VLSI & Embedded",
    venue: "IEEE Journal of Solid-State Circuits (JSSC)",
    year: 2026,
    citations: 14,
    doi: "10.1109/JSSC.2026.912847",
    abstract: "Design and taped-out verification of an ultra-low-noise 28nm FD-SOI amplifier operating at 4 Kelvin, enabling multiplexed readout of 64 concurrent spin qubits.",
    hasOpenPositions: true,
  },
];

export default function ResearchPage() {
  const { toast } = useToast();
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [raPaperTarget, setRaPaperTarget] = useState<ResearchPaper | null>(null);

  const [raForm, setRaForm] = useState({
    studentName: "Ananya Reddy",
    rollNumber: "22ECE1047",
    statement: "",
  });

  const filteredPapers = useMemo(() => {
    return RESEARCH_PAPERS.filter((p) => {
      const matchDomain = selectedDomain === "All" || p.domain === selectedDomain;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.facultyAdvisor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDomain && matchSearch;
    });
  }, [selectedDomain, searchQuery]);

  const handleRaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!raPaperTarget) return;

    toast({
      title: "Research Assistant Application Submitted!",
      description: `Your profile has been forwarded to ${raPaperTarget.facultyAdvisor}.`,
      variant: "success",
    });

    setRaPaperTarget(null);
    setRaForm({ ...raForm, statement: "" });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Microscope className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Institutional Research Showcase & Publications
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Peer-reviewed research across IEEE, ACM & Nature, student patents, and research assistant openings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 font-bold">
            ₹6.8 Cr Active Grants
          </Badge>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search papers by keywords, professor, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["All", "Artificial Intelligence", "VLSI & Embedded", "Renewable Energy"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                selectedDomain === d
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Papers Grid */}
      <div className="space-y-4">
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 p-6 shadow-sm hover:shadow-xl transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] font-bold">
                    {paper.domain}
                  </Badge>
                  <span className="text-xs text-slate-400 font-semibold">
                    {paper.venue} ({paper.year})
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-purple-500 transition-colors cursor-pointer" onClick={() => setSelectedPaper(paper)}>
                  {paper.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 self-start">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                  {paper.citations} Citations
                </span>
                {paper.hasOpenPositions && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> RA Opening
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {paper.abstract}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Authors: {paper.authors.join(", ")}
                </span>
                <span className="block text-[11px] text-slate-400">
                  Lab: {paper.facultyAdvisor}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPaper(paper)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  View Abstract
                </button>

                {paper.hasOpenPositions && (
                  <button
                    onClick={() => setRaPaperTarget(paper)}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-sm"
                  >
                    Apply for RA Position
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Abstract Modal */}
      <ModalForm
        isOpen={!!selectedPaper}
        onClose={() => setSelectedPaper(null)}
        title={selectedPaper?.title || "Research Paper"}
        description={`${selectedPaper?.venue || ""} • DOI: ${selectedPaper?.doi || ""}`}
      >
        {selectedPaper && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Full Abstract
              </span>
              <p className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border">
                {selectedPaper.abstract}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <div>
                <span className="text-slate-400 block font-semibold">Faculty Investigator</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedPaper.facultyAdvisor}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Verified DOI</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {selectedPaper.doi}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPaper(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </ModalForm>

      {/* RA Application Modal */}
      <ModalForm
        isOpen={!!raPaperTarget}
        onClose={() => setRaPaperTarget(null)}
        title="Apply as Undergraduate Research Assistant"
        description={`Research Project: ${raPaperTarget?.title || ""}`}
      >
        {raPaperTarget && (
          <form onSubmit={handleRaSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-slate-400 block">Faculty Advisor</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {raPaperTarget.facultyAdvisor}
              </span>
            </div>

            <div>
              <label className="font-semibold block mb-1">Statement of Purpose & Skills *</label>
              <textarea
                rows={4}
                required
                placeholder="Highlight your mathematical foundations, coding skills, and hours available per week..."
                value={raForm.statement}
                onChange={(e) => setRaForm({ ...raForm, statement: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRaPaperTarget(null)}
                className="px-4 py-2 rounded-xl border text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
              >
                Submit Application to Lab
              </button>
            </div>
          </form>
        )}
      </ModalForm>
    </div>
  );
}
