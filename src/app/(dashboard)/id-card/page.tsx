import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateStudentIdQr } from "@/lib/qr";
import {
  CheckCircle2,
  Download,
  IdCard,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function StudentIdCardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch student profile
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        include: { department: true },
      },
    },
  });

  const rollNumber = profile?.rollNumber || "2023CSE042";
  const qrCodeDataUrl =
    profile?.qrCodeUrl ||
    (await generateStudentIdQr(rollNumber, user.name));

  return (
    <div className="space-y-8 max-w-2xl mx-auto text-left">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <IdCard className="w-6 h-6 text-amber-500" />
          Official Digital Student ID Card
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cryptographically verifiable institutional identity card with gate-scanning QR code.
        </p>
      </div>

      {/* Premium Digital ID Card Canvas */}
      <div className="relative mx-auto w-full max-w-md rounded-3xl p-7 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/80 text-white border-2 border-amber-500/30 shadow-2xl overflow-hidden space-y-6">
        {/* Hologram / Watermark Pattern */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              C
            </div>
            <div>
              <div className="text-xs font-black tracking-tight text-white uppercase">
                CampusConnect Institute
              </div>
              <div className="text-[10px] text-amber-400 font-semibold tracking-wider">
                STUDENT IDENTITY PASS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Student Avatar & Basic Info */}
        <div className="flex items-start gap-5 relative z-10">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                user.avatar ||
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"
              }
              alt={user.name}
              className="w-24 h-28 rounded-2xl object-cover ring-2 ring-amber-500/40 shadow-md"
            />
            <div className="absolute -bottom-2 -right-2 p-1 rounded-full bg-slate-900 border border-amber-500 text-amber-400">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-lg font-black text-white tracking-tight">
              {user.name}
            </h3>
            <div className="text-xs font-mono font-extrabold text-amber-400">
              {rollNumber}
            </div>
            <div className="text-xs text-slate-300 font-medium">
              Dept: <b>{profile?.user.department?.code || "CSE"}</b> ({profile?.user.department?.name || "Computer Science"})
            </div>
            <div className="text-[11px] text-slate-400">
              Batch: {profile?.batch || "2022-2026"} · Sem {profile?.semester || 5} (Sec {profile?.section || "A"})
            </div>
          </div>
        </div>

        {/* Identification Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center relative z-10">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Blood Group
            </span>
            <span className="text-xs font-bold text-white">
              {profile?.bloodGroup || "O+"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Current CGPA
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {profile?.cgpa || 8.42}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Valid Thru
            </span>
            <span className="text-xs font-bold text-white font-mono">
              06 / 2026
            </span>
          </div>
        </div>

        {/* QR Code Verification Section */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white text-slate-900 shadow-inner relative z-10">
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-amber-600" />
              <span>Campus Security QR</span>
            </div>
            <div className="text-xs font-bold text-slate-900">
              Scan at Entrance Gate & Library
            </div>
            <p className="text-[10px] text-slate-500">
              Instant hostel, cafeteria, and lab access check.
            </p>
          </div>

          <div className="p-1 rounded-xl border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeDataUrl}
              alt="Student QR Code"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        {/* Footer Emergency info */}
        <div className="text-[10px] text-slate-400 text-center relative z-10 border-t border-slate-800/80 pt-3">
          Emergency Contact: {profile?.emergencyContact || "+91 98765 11223 (Guardian)"}
        </div>
      </div>
    </div>
  );
}
