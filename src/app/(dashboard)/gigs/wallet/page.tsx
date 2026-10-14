"use client";

import { GigsNav } from "@/components/gigs/GigsNav";
import { useToast } from "@/components/shared/Toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GigTransaction, useAppStore } from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  Coffee,
  Coins,
  Download,
  ExternalLink,
  FileCheck,
  HeartHandshake,
  Info,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

export default function GigWalletPage() {
  const store = useAppStore();
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role || "STUDENT";
  const userId = user?.id || "usr-ananya";

  // Certificate modal state
  const [selectedCertGig, setSelectedCertGig] = useState<{
    title: string;
    studentName: string;
    dept: string;
    posterName: string;
    date: string;
  } | null>(null);

  // Summary Metrics
  const totalEarnedCash = useMemo(() => {
    return store.gigTransactions
      .filter((t) => t.rewardType === "CASH" && (t.status === "PAID" || t.status === "RECEIVED"))
      .reduce((acc, t) => acc + (t.amount || 0), 0);
  }, [store.gigTransactions]);

  const pendingCash = useMemo(() => {
    return store.gigTransactions
      .filter((t) => t.rewardType === "CASH" && t.status === "PENDING")
      .reduce((acc, t) => acc + (t.amount || 0), 0);
  }, [store.gigTransactions]);

  const canteenTokens = useMemo(() => {
    return store.gigTransactions
      .filter((t) => t.rewardType === "CANTEEN_COUPON")
      .length * 3; // 3 meals/tokens per coupon
  }, [store.gigTransactions]);

  const volunteerHours = useMemo(() => {
    return store.gigs
      .filter((g) => g.status === "COMPLETED" && g.rewardType === "VOLUNTEER_HOURS")
      .reduce((acc, g) => acc + g.estimatedHours, 0);
  }, [store.gigs]);

  const certificatesEarned = useMemo(() => {
    return store.gigs.filter((g) => g.status === "COMPLETED" && g.rewardType === "CERTIFICATE");
  }, [store.gigs]);

  // Payment Confirmation Handlers
  const handlePosterConfirmPayment = (txId: string) => {
    store.confirmPosterPayment(txId);
    toast({
      title: "Payment Marked as Dispatched",
      description: "Payment transaction marked as released. Student has been prompted to confirm receipt.",
      variant: "success",
    });
  };

  const handleStudentConfirmReceipt = (txId: string) => {
    store.confirmStudentReceipt(txId);
    toast({
      title: "Payment Receipt Confirmed! 🎉",
      description: "Funds marked as successfully received. Transaction settled.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 text-left">
      {/* Top Nav */}
      <GigsNav userRole={userRole} userName={user?.name || undefined} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/5 border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Campus Earnings & Rewards Wallet
            </h1>
            <Badge variant="success" className="text-[10px]">
              Institutional Ledger
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulated secure settlement gateway with two-way payout verification (UPI / Bank transfer ready).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned */}
        <Card className="p-5 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Cash Earned</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalEarnedCash || 2700)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Settled through campus payouts</span>
          </div>
        </Card>

        {/* Pending Payouts */}
        <Card className="p-5 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Pending Release</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500">
            {formatCurrency(pendingCash || 2200)}
          </div>
          <div className="text-[11px] text-slate-400">
            Awaiting student or poster confirmation
          </div>
        </Card>

        {/* Canteen Meal Passes */}
        <Card className="p-5 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent border-orange-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Cafeteria Meal Tokens</span>
            <Coffee className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold text-orange-500">
            {canteenTokens || 3} <span className="text-xs font-normal text-slate-400">Meals</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Redeemable at Central Canteen
          </div>
        </Card>

        {/* Volunteer Hours / Credentials */}
        <Card className="p-5 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent border-sky-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Volunteer / CSR Hours</span>
            <Award className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-sky-500">
            {volunteerHours || 12} <span className="text-xs font-normal text-slate-400">Certified Hrs</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Accredited for institutional transcripts
          </div>
        </Card>
      </div>

      {/* Two-Way Settlement Gateway Simulation Notice */}
      <Card className="p-5 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Two-Way Escrow Settlement Flow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Poster marks payment as released → Student clicks "Confirm Received" → Direct audit trail generated.
                Designed for direct UPI / Razorpay webhook settlement.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 text-xs self-start sm:self-auto">
            Secure Audit Mode
          </Badge>
        </div>
      </Card>

      {/* Transactions Ledger */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Earnings & Rewards Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete history of task stipends, tokens, and verified payouts
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {store.gigTransactions.length} Records
          </Badge>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {store.gigTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3.5">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 mt-0.5",
                    tx.status === "RECEIVED"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : tx.status === "PAID"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-sky-500/10 text-sky-500"
                  )}
                >
                  {tx.rewardType === "CASH" ? "₹" : "🎁"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {tx.gigTitle}
                    </h4>
                    <Badge
                      variant={
                        tx.status === "RECEIVED"
                          ? "success"
                          : tx.status === "PAID"
                          ? "warning"
                          : "default"
                      }
                      className="text-[10px]"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Worker: <b>{tx.studentName}</b> · Reward: {tx.rewardDescription}
                  </p>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>Date: {tx.date}</span>
                    {tx.transactionRef && (
                      <span className="font-mono text-[10px] text-slate-500">Ref: {tx.transactionRef}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Action / Status */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {tx.rewardType === "CASH" && tx.amount ? `₹${tx.amount}` : tx.rewardType.replace("_", " ")}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {tx.studentConfirmed ? "Settled to Student" : "Pending Confirmation"}
                  </div>
                </div>

                {/* Interactive Confirmation Buttons */}
                {!tx.posterConfirmed && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => handlePosterConfirmPayment(tx.id)}
                  >
                    Mark as Paid
                  </Button>
                )}

                {tx.posterConfirmed && !tx.studentConfirmed && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => handleStudentConfirmReceipt(tx.id)}
                  >
                    Confirm Received
                  </Button>
                )}

                {tx.studentConfirmed && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Available Completion Certificates */}
      <Card className="p-5 border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Earned Practicum & Completion Certificates
            </h3>
          </div>
          <Badge variant="warning">Digital Credentials</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/40">
                Biohazard Practicum
              </Badge>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                Microbiology Culture Petri Dish Sterilization
              </h4>
              <p className="text-[11px] text-slate-500">
                Issued by: Dr. Anirudh Sen · BioTech Dept
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5"
              onClick={() =>
                setSelectedCertGig({
                  title: "Microbiology Culture Petri Dish Sterilization",
                  studentName: user?.name || "Ananya Reddy",
                  dept: "Electronics & Communication Engineering",
                  posterName: "Dr. Anirudh Sen (Head of BioTech)",
                  date: "October 14, 2026",
                })
              }
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>View & Export</span>
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 flex items-center justify-between">
            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px] text-sky-500 border-sky-500/40">
                Designer Portfolio Credential
              </Badge>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                Campus Placement Brochure & Social Media Creatives
              </h4>
              <p className="text-[11px] text-slate-500">
                Issued by: Dr. S. Prakash · CDC Placement Cell
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5"
              onClick={() =>
                setSelectedCertGig({
                  title: "Campus Placement Brochure & Social Media Creatives",
                  studentName: user?.name || "Ananya Reddy",
                  dept: "Electronics & Communication Engineering",
                  posterName: "Dr. S. Prakash (Dean & Placement Director)",
                  date: "October 10, 2026",
                })
              }
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>View & Export</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Certificate Modal */}
      {selectedCertGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <Card className="w-full max-w-2xl p-8 bg-white dark:bg-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-6 text-center relative overflow-hidden">
            {/* Watermark Seal */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-500/5 border-4 border-amber-500/10 pointer-events-none flex items-center justify-center">
              <Sparkles className="w-20 h-20 text-amber-500/10" />
            </div>

            <button
              onClick={() => setSelectedCertGig(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                Official Campus Work Practicum Credential
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
                Certificate of Completed Campus Practicum
              </h2>
              <p className="text-xs text-slate-400">
                Verified through Campus Gigs Marketplace & Academic Affairs Board
              </p>
            </div>

            {/* Certificate Body */}
            <div className="py-4 space-y-3 border-y border-amber-500/20 text-slate-700 dark:text-slate-300">
              <p className="text-xs">This is proudly awarded to</p>
              <div className="text-2xl font-extrabold text-amber-500 tracking-wide">
                {selectedCertGig.studentName}
              </div>
              <p className="text-xs text-slate-500">
                Department of {selectedCertGig.dept}
              </p>
              <p className="text-xs max-w-md mx-auto leading-relaxed pt-2">
                for satisfactory completion of peer deliverables and academic assistance in:
              </p>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                "{selectedCertGig.title}"
              </div>
            </div>

            {/* Signatures Footer */}
            <div className="flex items-center justify-between text-left text-xs pt-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Date of Issuance</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedCertGig.date}</span>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-emerald-500 font-bold block">VERIFIED CREDENTIAL</span>
                <span className="font-mono text-[9px] text-slate-400">CERT-2026-CAMPUS-9912</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Verified Supervisor</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedCertGig.posterName}</span>
              </div>
            </div>

            {/* Print / Download Button */}
            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCertGig(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
