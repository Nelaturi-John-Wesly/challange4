import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintButtonClient } from "./PrintButtonClient";

export default async function FeeReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resolvedParams = await params;
  const invoice = await prisma.feeInvoice.findUnique({
    where: { id: resolvedParams.id },
    include: {
      student: {
        include: {
          department: true,
          studentProfile: true,
        },
      },
      transactions: true,
    },
  });

  if (!invoice || invoice.status !== "PAID") {
    notFound();
  }

  const student = invoice.student;
  const profile = student.studentProfile;
  const transaction = invoice.transactions[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-left">
      {/* Top Bar for Screen (Hidden on Print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/fees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fee Portal
        </Link>
        <div className="flex items-center gap-2">
          <PrintButtonClient />
        </div>
      </div>

      {/* Official Institutional Receipt Document (Print-Styled) */}
      <div className="p-8 sm:p-12 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-xl print:border-none print:shadow-none print:p-0">
        {/* Header with Seal */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-2xl tracking-tighter">
              CC
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                CampusConnect Institute of Technology
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Autonomous Institution Affiliated with National University
              </p>
              <p className="text-[11px] text-slate-500">
                Campus Drive, Knowledge Park IV · Contact: accounts@college.edu
              </p>
            </div>
          </div>

          <div className="text-right">
            <Badge variant="success" className="text-xs font-mono font-bold py-1 px-3">
              PAID RECEIPT
            </Badge>
            <div className="text-xs font-mono font-bold mt-2 text-slate-800">
              #{invoice.receiptNumber}
            </div>
            <div className="text-[11px] text-slate-500">
              Date: {formatDate(invoice.paidAt || invoice.createdAt)}
            </div>
          </div>
        </div>

        {/* Student Identification Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
              Student Name
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {student.name}
            </span>
          </div>

          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
              Roll Number
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {profile?.rollNumber || "N/A"}
            </span>
          </div>

          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
              Department
            </span>
            <span className="font-semibold text-slate-900">
              {student.department?.code} ({student.department?.name})
            </span>
          </div>

          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
              Batch & Term
            </span>
            <span className="font-semibold text-slate-900">
              Sem {profile?.semester} ({profile?.batch})
            </span>
          </div>
        </div>

        {/* Itemized Fee Table */}
        <div className="py-6 space-y-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-[11px] font-bold uppercase text-slate-600">
                <th className="py-2">Sl.</th>
                <th className="py-2">Particulars / Description</th>
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-mono">1.</td>
                <td className="py-3 font-bold text-slate-900">
                  {invoice.title}
                </td>
                <td className="py-3 font-mono">{invoice.feeType}</td>
                <td className="py-3 font-mono font-bold text-right text-slate-900">
                  {formatCurrency(invoice.amount)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-extrabold text-sm sm:text-base">
                <td colSpan={3} className="py-3 text-right pr-4">
                  Grand Total Cleared:
                </td>
                <td className="py-3 text-right font-mono text-emerald-700">
                  {formatCurrency(invoice.amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Transaction Verification Details */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Gateway Ref:</span>
            <span className="font-bold text-slate-800">
              {transaction?.gatewayRef || "MOCK-TXN-VERIFIED-9842"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Mode:</span>
            <span className="font-bold text-slate-800">
              {invoice.paymentMethod || "ELECTRONIC_TRANSFER"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-emerald-700">
              SETTLED & VERIFIED (SUCCESS)
            </span>
          </div>
        </div>

        {/* Signatures & Seal */}
        <div className="pt-10 flex items-end justify-between text-xs text-slate-600">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Computer-Generated Certified Receipt</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Valid for university records and hostel clearance. No manual signature required.
            </p>
          </div>

          <div className="text-center space-y-1">
            <div className="w-32 border-b border-slate-400 mx-auto" />
            <span className="text-[11px] font-bold text-slate-800 block">
              Registrar / Accounts Officer
            </span>
            <span className="text-[10px] text-slate-500">Finance & Fee Cell</span>
          </div>
        </div>
      </div>
    </div>
  );
}
