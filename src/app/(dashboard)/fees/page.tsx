import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FeeCheckoutClient } from "./FeeCheckoutClient";

export default async function FeesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch invoices for user if student, or all recent invoices if admin
  const invoices = await prisma.feeInvoice.findMany({
    where: user.role === "STUDENT" ? { studentId: user.id } : undefined,
    include: { student: true },
    orderBy: { dueDate: "desc" },
  });

  const totalBilled = invoices.reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = invoices
    .filter((f) => f.status === "PAID")
    .reduce((acc, f) => acc + f.amount, 0);
  const totalOutstanding = invoices
    .filter((f) => f.status === "PENDING" || f.status === "OVERDUE")
    .reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-500" />
            Institutional Fee Portal & Payments
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tuition installments, university exam registrations, hostel dues, and downloadable receipts.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(totalBilled)}
          subtitle="All Academic Dues"
          icon={<FileText className="w-5 h-5 text-slate-500" />}
        />
        <StatCard
          title="Cleared & Paid"
          value={formatCurrency(totalPaid)}
          subtitle="Verified Transactions"
          variant="success"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          title="Current Outstanding"
          value={formatCurrency(totalOutstanding)}
          subtitle={totalOutstanding > 0 ? "Payment Pending" : "Zero Balance"}
          variant={totalOutstanding > 0 ? "warning" : "default"}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Fee Invoices & Historical Transactions
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4">Fee Description</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Due Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action / Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => {
                const isPaid = inv.status === "PAID";

                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {inv.title}
                      </div>
                      {inv.receiptNumber && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          Receipt #{inv.receiptNumber}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant="outline" className="text-xs font-mono">
                        {inv.feeType}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(inv.amount)}
                    </td>

                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(inv.dueDate)}
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant={isPaid ? "success" : "warning"}>
                        {inv.status}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {isPaid ? (
                        <Link href={`/fees/receipt/${inv.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Download className="w-3.5 h-3.5 text-amber-500" />
                            Download Receipt
                          </Button>
                        </Link>
                      ) : (
                        <FeeCheckoutClient invoice={inv} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
