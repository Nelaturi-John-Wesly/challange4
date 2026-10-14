"use client";

import React, { useState, useEffect } from "react";
import { School, MapPin, CheckCircle2, ArrowRight, Building2, PlusCircle, X } from "lucide-react";
import { CollegeLogo } from "@/components/shared/CollegeLogo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/Toast";
import { useRouter } from "next/navigation";

interface CompleteProfilePromptProps {
  currentCollegeId?: string | null;
  currentCollegeName?: string | null;
}

export function CompleteProfilePrompt({
  currentCollegeId,
  currentCollegeName,
}: CompleteProfilePromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // If user has no collegeId or if explicitly triggered
  useEffect(() => {
    if (!currentCollegeId || currentCollegeId === "col-none") {
      setIsOpen(true);
    }
  }, [currentCollegeId]);

  useEffect(() => {
    fetch("/api/colleges")
      .then((res) => res.json())
      .then((data) => {
        if (data.colleges && data.colleges.length > 0) {
          setColleges(data.colleges);
          setSelectedId(data.colleges[0].id);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleSaveCollege = async () => {
    setLoading(true);
    try {
      let collegeIdToSet = selectedId;

      if (isAddingNew) {
        if (!newName.trim() || newName.trim().length < 3) {
          toast({ title: "Name Required", description: "College name must have at least 3 letters.", variant: "warning" });
          setLoading(false);
          return;
        }
        if (!newCity.trim() || !newState.trim()) {
          toast({ title: "Location Required", description: "Please enter both City and State.", variant: "warning" });
          setLoading(false);
          return;
        }

        // Create college
        const colRes = await fetch("/api/colleges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName, city: newCity, state: newState }),
        });
        const colData = await colRes.json();
        if (!colRes.ok) throw new Error(colData.error || "Failed to add college");
        collegeIdToSet = colData.college.id;
      }

      // Update user's profile with collegeId
      const updateRes = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: collegeIdToSet }),
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.error || "Failed to update profile");

      toast({
        title: "Profile Completed! 🎓",
        description: "Your college affiliation has been linked successfully.",
        variant: "success",
      });

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const selectedObj = colleges.find((c) => c.id === selectedId);

  return (
    <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-amber-600/10 border border-amber-500/40 text-left shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Action Required
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                One-Time Setup
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Complete Your Profile: Choose Your College
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Link your institutional account to your college to receive customized campus alerts, timetable synchronization, and your official emblem logo.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-slate-400 hover:text-white sm:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* College Selection Controls */}
      <div className="mt-4 pt-3.5 border-t border-amber-500/20 grid sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 space-y-2">
          {!isAddingNew ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="flex-1">
                <select
                  value={selectedId}
                  onChange={(e) => {
                    if (e.target.value === "__NEW__") {
                      setIsAddingNew(true);
                    } else {
                      setSelectedId(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city}, {c.state})
                    </option>
                  ))}
                  <option value="__NEW__">✨ My college is not listed → Add new</option>
                </select>
              </div>
              {selectedObj && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                  <CollegeLogo collegeName={selectedObj.name} size="xs" />
                  <span className="text-xs text-slate-300">{selectedObj.city}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">Add New Institution</span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  ← Pick from list
                </button>
              </div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Official College Name (e.g. Stanford University)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-amber-500/40 text-white text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="City (e.g. Stanford)"
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                />
                <input
                  type="text"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  placeholder="State (e.g. California)"
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          )}
        </div>

        <div className="sm:col-span-4 flex items-center justify-end gap-2">
          <Button
            onClick={handleSaveCollege}
            disabled={loading}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white gap-2 font-semibold text-xs py-2"
          >
            {loading ? "Connecting..." : "Save College"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
