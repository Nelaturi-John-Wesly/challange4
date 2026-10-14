"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { CollegeLogo } from "@/components/shared/CollegeLogo";
import { AvatarCropModal } from "@/components/profile/AvatarCropModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/shared/Toast";
import {
  Camera,
  Trash2,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  School,
  MapPin,
  Sparkles,
  Shield,
  User,
  GraduationCap,
  KeyRound,
  Bell,
  Palette,
  Eye,
  EyeOff,
  AlertTriangle,
  Save,
  X,
  Upload,
  RefreshCw,
  Building2,
  Tag,
  FileText,
} from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "settings" | "college">("overview");
  const [profile, setProfile] = useState<any>(null);
  const [colleges, setColleges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Form States
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDepartment, setEditDepartment] = useState("CSE");
  const [editRollNumber, setEditRollNumber] = useState("");
  const [editYear, setEditYear] = useState("3");
  const [editSemester, setEditSemester] = useState("5");
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editCollegeId, setEditCollegeId] = useState("");

  // College Confirmation Modal
  const [showCollegeConfirm, setShowCollegeConfirm] = useState(false);
  const [pendingCollegeId, setPendingCollegeId] = useState("");

  // Avatar states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Settings states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [notifAcademic, setNotifAcademic] = useState(true);
  const [notifGigs, setNotifGigs] = useState(true);
  const [notifEvents, setNotifEvents] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(true);

  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [hidePhone, setHidePhone] = useState(false);
  const [hideEmail, setHideEmail] = useState(false);

  // Delete account state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // AI & Upload Logo state
  const [isGeneratingAiLogo, setIsGeneratingAiLogo] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const collegeLogoFileRef = useRef<HTMLInputElement | null>(null);

  // Load profile & colleges on mount
  useEffect(() => {
    loadProfileData();
    loadColleges();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.user) {
        const u = data.user;
        setProfile(u);
        setEditName(u.name || "");
        setEditPhone(u.phone || "");
        setEditDepartment(u.department?.code || "CSE");
        setEditRollNumber(u.studentProfile?.rollNumber || u.facultyProfile?.employeeId || "");
        setEditYear(String(u.studentProfile?.year || 3));
        setEditSemester(String(u.studentProfile?.semester || 5));
        setEditBio(u.bio || "");
        setEditSkills(u.skills || "");
        setEditGithub(u.githubUrl || "");
        setEditLinkedin(u.linkedinUrl || "");
        setEditCollegeId(u.collegeId || u.college?.id || "");

        if (u.settings) {
          setThemeMode(u.settings.themePreference || "dark");
          setAccentColor(u.settings.accentColor || u.college?.themeColor || "#f59e0b");
          setHidePhone(Boolean(u.settings.hidePhone));
          setHideEmail(Boolean(u.settings.hideEmail));
          if (u.settings.notificationPrefs) {
            setNotifAcademic(Boolean(u.settings.notificationPrefs.academic));
            setNotifGigs(Boolean(u.settings.notificationPrefs.gigs));
            setNotifEvents(Boolean(u.settings.notificationPrefs.events));
            setNotifAlerts(Boolean(u.settings.notificationPrefs.alerts));
          }
        }
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadColleges = async () => {
    try {
      const res = await fetch("/api/colleges");
      const data = await res.json();
      if (data.colleges) {
        setColleges(data.colleges);
      }
    } catch {}
  };

  // Avatar file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid File", description: "Please upload an image file (JPG, PNG, WebP).", variant: "warning" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Image size must be less than 2 MB.", variant: "warning" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Save Cropped Avatar
  const handleApplyCroppedAvatar = async (croppedDataUrl: string) => {
    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarDataUrl: croppedDataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save avatar");

      setProfile((prev: any) => ({ ...prev, avatar: croppedDataUrl }));
      await updateSession({ user: { avatar: croppedDataUrl } });

      toast({
        title: "Photo Updated! 📸",
        description: "Your new profile picture has been saved.",
        variant: "success",
      });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "error" });
    }
  };

  // Remove Avatar Photo
  const handleRemoveAvatar = async () => {
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove avatar");

      setProfile((prev: any) => ({ ...prev, avatar: null }));
      await updateSession({ user: { avatar: null } });

      toast({
        title: "Photo Removed",
        description: "Reverted to name initials fallback.",
        variant: "info",
      });
    } catch (err: any) {
      toast({ title: "Remove Failed", description: err.message, variant: "error" });
    }
  };

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: editName,
        phone: editPhone,
        bio: editBio,
        skills: editSkills,
        githubUrl: editGithub,
        linkedinUrl: editLinkedin,
        collegeId: editCollegeId,
        departmentCode: editDepartment,
        rollNumber: editRollNumber,
        year: parseInt(editYear, 10),
        semester: parseInt(editSemester, 10),
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setProfile((prev: any) => ({
        ...prev,
        ...data.user,
        college: colleges.find((c) => c.id === editCollegeId) || prev.college,
      }));

      await updateSession({
        user: {
          name: editName,
          collegeId: editCollegeId,
          collegeName: colleges.find((c) => c.id === editCollegeId)?.name,
          collegeCity: colleges.find((c) => c.id === editCollegeId)?.city,
        },
      });

      toast({
        title: "Profile Saved! ✨",
        description: "Your personal details have been updated successfully.",
        variant: "success",
      });
      setActiveTab("overview");
    } catch (err: any) {
      toast({ title: "Save Error", description: err.message, variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // College Change Request with confirmation
  const handleCollegeDropdownChange = (newColId: string) => {
    if (newColId !== editCollegeId) {
      setPendingCollegeId(newColId);
      setShowCollegeConfirm(true);
    }
  };

  const confirmCollegeChange = () => {
    setEditCollegeId(pendingCollegeId);
    setShowCollegeConfirm(false);
    toast({
      title: "College Affiliation Selected",
      description: "Click 'Save Changes' to finalize your institution update.",
      variant: "info",
    });
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPass(true);
    try {
      if (newPassword !== confirmPassword) {
        throw new Error("New password and confirmation do not match.");
      }
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      toast({
        title: "Password Changed! 🔐",
        description: "Your security credentials have been updated.",
        variant: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Security Error", description: err.message, variant: "error" });
    } finally {
      setIsChangingPass(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/profile/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationPrefs: {
            academic: notifAcademic,
            gigs: notifGigs,
            events: notifEvents,
            alerts: notifAlerts,
          },
          themePreference: themeMode,
          accentColor,
          hidePhone,
          hideEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      toast({
        title: "Preferences Saved! ⚙️",
        description: "Notification and privacy settings updated.",
        variant: "success",
      });
    } catch (err: any) {
      toast({ title: "Settings Error", description: err.message, variant: "error" });
    }
  };

  // AI Generate Logo
  const handleAiGenerateLogo = async () => {
    setIsGeneratingAiLogo(true);
    try {
      const res = await fetch("/api/colleges/ai-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: profile?.college?.id || profile?.collegeId,
          collegeName: profile?.college?.name,
          city: profile?.college?.city,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI logo");

      setProfile((prev: any) => ({
        ...prev,
        college: { ...prev.college, logoUrl: data.logoUrl },
      }));

      toast({
        title: "Emblem Generated! 🎨",
        description: data.message,
        variant: "success",
      });
    } catch (err: any) {
      toast({ title: "Generation Error", description: err.message, variant: "error" });
    } finally {
      setIsGeneratingAiLogo(false);
    }
  };

  // Official Logo Upload
  const handleOfficialLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Emblem file must be less than 2 MB.", variant: "warning" });
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/colleges/upload-logo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collegeId: profile?.college?.id || profile?.collegeId,
            dataUrl: reader.result as string,
            mimeType: file.type,
            sizeBytes: file.size,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to upload official emblem");

        setProfile((prev: any) => ({
          ...prev,
          college: { ...prev.college, logoUrl: reader.result as string },
        }));

        toast({
          title: "Official Emblem Uploaded! 🏛️",
          description: "Institutional emblem has been updated and will show across the platform.",
          variant: "success",
        });
      } catch (err: any) {
        toast({ title: "Upload Error", description: err.message, variant: "error" });
      } finally {
        setIsUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Password Strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "bg-slate-700" };
    let s = 0;
    if (pass.length >= 6) s += 1;
    if (pass.length >= 10) s += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) s += 1;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) s += 1;

    if (s <= 1) return { score: 25, label: "Weak", color: "bg-rose-500" };
    if (s === 2) return { score: 50, label: "Fair", color: "bg-amber-500" };
    if (s === 3) return { score: 75, label: "Good", color: "bg-sky-500" };
    return { score: 100, label: "Strong & Secure", color: "bg-emerald-500" };
  };

  const passStrength = getPasswordStrength(newPassword);

  const college = profile?.college || {
    name: "Narasaraopeta Engineering College",
    city: "Narasaraopet",
    state: "Andhra Pradesh",
    country: "India",
    themeColor: "#f59e0b",
  };

  const currentThemeColor = profile?.settings?.accentColor || college?.themeColor || "#f59e0b";

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={collegeLogoFileRef}
        onChange={handleOfficialLogoUpload}
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
      />

      {/* Avatar Crop & Zoom Modal */}
      <AvatarCropModal
        isOpen={cropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleApplyCroppedAvatar}
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER CARD: Futuristic Institutional Persona */}
      {/* ------------------------------------------------------------- */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-slate-900/90 border shadow-2xl backdrop-blur-md"
        style={{
          borderColor: currentThemeColor + "45",
          boxShadow: `0 20px 40px -15px ${currentThemeColor}20`,
        }}
      >
        {/* Ambient Top Glow Line in College Theme Color */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-current to-transparent"
          style={{ color: currentThemeColor }}
        />

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Profile Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 p-0.5 shadow-xl transition-transform group-hover:scale-102"
                style={{ borderColor: currentThemeColor }}
              >
                {profile?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center font-extrabold text-2xl sm:text-3xl text-white shadow-inner"
                    style={{ backgroundColor: currentThemeColor + "25", color: currentThemeColor }}
                  >
                    {profile?.name
                      ? profile.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "ME"}
                  </div>
                )}
              </div>

              {/* Upload Trigger Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-950 border border-slate-700 text-white hover:text-amber-400 hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Name, Role & Contact */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profile?.name || session?.user?.name || "Student"}
                </h1>
                <Badge
                  variant="outline"
                  className="uppercase px-2.5 py-0.5 font-bold text-[10px] tracking-wider"
                  style={{
                    color: currentThemeColor,
                    borderColor: currentThemeColor + "60",
                    backgroundColor: currentThemeColor + "15",
                  }}
                >
                  {profile?.role || session?.user?.role || "STUDENT"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {profile?.email || session?.user?.email}
                </span>
                {profile?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {profile.phone}
                  </span>
                )}
                {profile?.studentProfile?.rollNumber && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                    ID: {profile.studentProfile.rollNumber}
                  </span>
                )}
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-slate-300 max-w-md pt-1 line-clamp-2">
                {profile?.bio ||
                  "Computer Science & Engineering student pursuing campus projects, part-time work, and academic research."}
              </p>

              {/* Avatar remove action if present */}
              {profile?.avatar && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: College Identity Card */}
          <div
            className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border flex items-center gap-4 shrink-0 max-w-sm w-full md:w-auto shadow-md"
            style={{ borderColor: currentThemeColor + "30" }}
          >
            <CollegeLogo
              collegeName={college.name}
              logoUrl={college.logoUrl}
              themeColor={college.themeColor}
              size="lg"
              className="shrink-0 shadow-xl"
            />
            <div className="min-w-0 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <School className="w-3 h-3" />
                Affiliated Institution
              </span>
              <h3 className="font-extrabold text-sm text-white truncate max-w-[200px]" title={college.name}>
                {college.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span>
                  {college.city}, {college.state}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          {[
            { key: "overview", label: "Overview & Details", icon: User },
            { key: "edit", label: "Edit Profile", icon: FileText },
            { key: "college", label: "College & Logo Seal", icon: School },
            { key: "settings", label: "Settings & Security", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20 scale-[1.02]"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TAB CONTENT */}
      {/* ------------------------------------------------------------- */}

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-12 gap-6 animate-in fade-in">
          {/* Academic Profile */}
          <div className="md:col-span-7 space-y-6">
            <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <GraduationCap className="w-4 h-4 text-amber-500" />
                Academic & Department Records
              </h3>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Department</span>
                  <p className="font-bold text-slate-100 text-sm mt-0.5">
                    {profile?.department?.name || "Computer Science & Engineering"}
                  </p>
                  <span className="text-[10px] text-amber-400 font-mono">
                    Code: {profile?.department?.code || "CSE"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Class Year & Semester</span>
                  <p className="font-bold text-slate-100 text-sm mt-0.5">
                    Year {profile?.studentProfile?.year || 3} · Semester {profile?.studentProfile?.semester || 5}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Section {profile?.studentProfile?.section || "A"} · Batch {profile?.studentProfile?.batch || "2023-2027"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Registration / Roll No.</span>
                  <p className="font-bold text-slate-100 text-sm mt-0.5 font-mono">
                    {profile?.studentProfile?.rollNumber || "22ECE1047"}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Verified Student</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Cumulative GPA (CGPA)</span>
                  <p className="font-bold text-slate-100 text-sm mt-0.5">
                    {profile?.studentProfile?.cgpa || "8.42"} / 10.0
                  </p>
                  <span className="text-[10px] text-amber-400">First Class with Distinction</span>
                </div>
              </div>

              {/* Bio Section */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-300">About / Personal Bio</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  {profile?.bio ||
                    "Passionate undergraduate student actively engaged in full-stack web engineering, campus part-time gigs, and algorithmic research."}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  Technical & Campus Skills
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(profile?.skills || "TypeScript, React, Next.js, Python, Tailwind CSS, UI/UX")
                    .split(",")
                    .map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30"
                      >
                        {s.trim()}
                      </span>
                    ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Socials & Institutional Contact */}
          <div className="md:col-span-5 space-y-6">
            <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Lock className="w-4 h-4 text-amber-500" />
                Institutional Identity & Contact
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">College Email</span>
                    <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  </div>
                  <p className="font-semibold text-slate-200 mt-1">{profile?.email}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Managed by institutional single-sign-on (SSO).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Phone Number</span>
                  <p className="font-semibold text-slate-200 mt-1">
                    {profile?.phone || "Not provided"}
                  </p>
                </div>

                {/* Social Links */}
                <div className="pt-2 space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Social Profiles</span>
                  <div className="flex flex-col gap-2">
                    {profile?.githubUrl ? (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                      >
                        <GithubIcon className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{profile.githubUrl}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No GitHub link provided.</span>
                    )}

                    {profile?.linkedinUrl ? (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        <LinkedinIcon className="w-4 h-4 text-sky-400" />
                        <span className="truncate">{profile.linkedinUrl}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No LinkedIn link provided.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => setActiveTab("edit")}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold"
                >
                  Edit Profile Information
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB: EDIT PROFILE */}
      {activeTab === "edit" && (
        <Card className="p-6 sm:p-8 bg-slate-900 border-slate-800 animate-in fade-in">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Edit Profile Information
                </h3>
                <p className="text-xs text-slate-400">
                  Update your display details, contacts, bio, and skills.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("overview")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center justify-between">
                  <span>College Email (Locked)</span>
                  <Lock className="w-3 h-3 text-slate-500" />
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Roll Number / Employee ID</label>
                <input
                  type="text"
                  value={editRollNumber}
                  onChange={(e) => setEditRollNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Department</label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                >
                  <option value="CSE">CSE - Computer Science & Engineering</option>
                  <option value="ECE">ECE - Electronics & Communication</option>
                  <option value="MECH">MECH - Mechanical Engineering</option>
                  <option value="IT">IT - Information Technology</option>
                  <option value="CIVIL">CIVIL - Civil Engineering</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Year / Semester</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* College Affiliation Selector with Confirmation Modal */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <School className="w-4 h-4 text-amber-500" />
                  Primary College Affiliation
                </label>
                <span className="text-[10px] text-amber-400">Confirmation prompt on change</span>
              </div>
              <select
                value={editCollegeId}
                onChange={(e) => handleCollegeDropdownChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 cursor-pointer"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city}, {c.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Bio & Skills */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">About / Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell campus colleagues, recruiters, and faculty about your interests..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  placeholder="e.g. Next.js, Python, Figma, Circuit Design"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setActiveTab("overview")}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : "Save Profile Details"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB: COLLEGE & LOGO SEAL */}
      {activeTab === "college" && (
        <div className="grid md:grid-cols-12 gap-6 animate-in fade-in">
          {/* Logo Showcase Card */}
          <div className="md:col-span-5 space-y-6">
            <Card className="p-6 bg-slate-900 border-slate-800 flex flex-col items-center text-center space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Institutional Seal & Emblem
              </span>

              <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center">
                <CollegeLogo
                  collegeName={college.name}
                  logoUrl={college.logoUrl}
                  themeColor={college.themeColor}
                  size="2xl"
                  className="shadow-2xl"
                />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{college.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {college.city}, {college.state}, {college.country || "India"}
                </p>
                <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Theme Accent: {college.themeColor}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2 pt-2">
                <Button
                  onClick={handleAiGenerateLogo}
                  disabled={isGeneratingAiLogo}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingAiLogo ? "Generating..." : "AI-Generate Emblem Logo"}
                </Button>

                {(profile?.role === "ADMIN" || profile?.role === "FACULTY") && (
                  <Button
                    onClick={() => collegeLogoFileRef.current?.click()}
                    disabled={isUploadingLogo}
                    variant="outline"
                    className="w-full text-xs font-bold gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-500" />
                    {isUploadingLogo ? "Uploading..." : "Upload Official College Logo"}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* College Details & Switcher */}
          <div className="md:col-span-7 space-y-6">
            <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Building2 className="w-4 h-4 text-amber-500" />
                Institutional Details & Directory
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Institutional Name</span>
                  <p className="font-bold text-slate-100 text-sm mt-0.5">{college.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">City</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{college.city}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">State</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{college.state}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Switch Affiliated College</span>
                    <span className="text-[10px] text-slate-400">All student records sync</span>
                  </div>
                  <select
                    value={editCollegeId}
                    onChange={(e) => handleCollegeDropdownChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs cursor-pointer focus:border-amber-500"
                  >
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.city}, {c.state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS & SECURITY */}
      {activeTab === "settings" && (
        <div className="grid md:grid-cols-12 gap-6 animate-in fade-in">
          {/* Security & Password */}
          <div className="md:col-span-6 space-y-6">
            <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <KeyRound className="w-4 h-4 text-amber-500" />
                Change Password
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">New Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                  />
                  {/* Strength Meter */}
                  {newPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Strength:</span>
                        <span className="font-bold text-slate-200">{passStrength.label}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${passStrength.color} transition-all duration-300`}
                          style={{ width: `${passStrength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPass}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                  >
                    {isChangingPass ? "Updating Password..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Danger Zone: Delete Account */}
            <Card className="p-6 bg-slate-900 border-rose-900/40 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Danger Zone: Delete Account
              </h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Permanently delete your profile, academic attendance logs, submissions, and credentials.
              </p>
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 space-y-2">
                <span className="text-[11px] text-rose-300">
                  Type <b>DELETE MY ACCOUNT</b> to confirm:
                </span>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-rose-800 text-white text-xs"
                />
                <Button
                  onClick={async () => {
                    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
                      toast({ title: "Confirmation Mismatch", description: "Please type DELETE MY ACCOUNT exactly.", variant: "warning" });
                      return;
                    }
                    setIsDeleting(true);
                    try {
                      const res = await fetch("/api/profile", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ confirmationText: deleteConfirmText }),
                      });
                      if (!res.ok) throw new Error("Deletion failed");
                      toast({ title: "Account Deleted", description: "Redirecting...", variant: "info" });
                      window.location.href = "/login";
                    } catch (e: any) {
                      toast({ title: "Error", description: e.message, variant: "error" });
                      setIsDeleting(false);
                    }
                  }}
                  disabled={deleteConfirmText !== "DELETE MY ACCOUNT" || isDeleting}
                  variant="danger"
                  size="sm"
                  className="w-full mt-1"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete My Account"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Preferences & Privacy */}
          <div className="md:col-span-6 space-y-6">
            <Card className="p-6 bg-slate-900 border-slate-800 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Bell className="w-4 h-4 text-amber-500" />
                Notification Preferences
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  {
                    id: "academic",
                    title: "Academic Deadlines & Attendance Alerts",
                    desc: "Notifications for <75% warnings and upcoming exams",
                    checked: notifAcademic,
                    setter: setNotifAcademic,
                  },
                  {
                    id: "gigs",
                    title: "Campus Gigs & Part-Time Work",
                    desc: "Updates on applications, payments, and ratings",
                    checked: notifGigs,
                    setter: setNotifGigs,
                  },
                  {
                    id: "events",
                    title: "Club Inductions & Fest Tickets",
                    desc: "Pass alerts and invitations from campus leads",
                    checked: notifEvents,
                    setter: setNotifEvents,
                  },
                  {
                    id: "alerts",
                    title: "Campus Emergency Broadcasts",
                    desc: "Priority institutional circulars from the Dean",
                    checked: notifAlerts,
                    setter: setNotifAlerts,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-200">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.setter(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Privacy Toggles */}
              <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                  Peer Privacy Controls
                </h4>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div>
                    <span className="font-semibold text-slate-200">Hide Phone Number</span>
                    <p className="text-[11px] text-slate-500">Hide from other students in directories</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hidePhone}
                    onChange={(e) => setHidePhone(e.target.checked)}
                    className="accent-amber-500 cursor-pointer w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div>
                    <span className="font-semibold text-slate-200">Hide Email Address</span>
                    <p className="text-[11px] text-slate-500">Show only roll number to peer students</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hideEmail}
                    onChange={(e) => setHideEmail(e.target.checked)}
                    className="accent-amber-500 cursor-pointer w-4 h-4"
                  />
                </div>
              </div>

              {/* Save Settings Button */}
              <div className="pt-2">
                <Button
                  onClick={handleSaveSettings}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                >
                  Save Preferences & Privacy
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Changing College */}
      {showCollegeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/50 rounded-2xl p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Change Primary Institution?</h3>
                <p className="text-xs text-slate-400">This updates your campus affiliations and emblem seal.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              You are selecting a new college affiliation. Your profile header, timetable, and attendance reports will be linked to this institution.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCollegeConfirm(false);
                  setPendingCollegeId("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmCollegeChange}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                Confirm Institution Change
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
