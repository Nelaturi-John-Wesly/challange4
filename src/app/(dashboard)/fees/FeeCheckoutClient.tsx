"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, CreditCard, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface Props {
  invoice: any;
}

export function FeeCheckoutClient({ invoice }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/fees/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          paymentMethod: method,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReceiptNumber(data.receiptNumber);
        setIsSuccess(true);
        setTimeout(() => {
          router.push(`/fees/receipt/${invoice.id}`);
          router.refresh();
        }, 1500);
      }
    } catch {
      //
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="font-bold gap-2 text-xs"
      >
        <CreditCard className="w-3.5 h-3.5" />
        Pay Dues
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Institutional Payment Gateway"
        description={`Settling: ${invoice.title}`}
      >
        {isSuccess ? (
          <div className="py-8 text-center text-emerald-500 space-y-3">
            <CheckCircle2 className="w-16 h-16 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Payment Confirmed!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receipt <b>#{receiptNumber}</b> has been issued. Redirecting to receipt...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Amount Banner */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total Payable Amount
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {formatCurrency(invoice.amount)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Payment Mode (Simulated)
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("UPI")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    method === "UPI"
                      ? "border-amber-500 bg-amber-500/10 text-amber-500 font-bold ring-2 ring-amber-500/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("CARD")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    method === "CARD"
                      ? "border-amber-500 bg-amber-500/10 text-amber-500 font-bold ring-2 ring-amber-500/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Debit/Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("NETBANKING")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    method === "NETBANKING"
                      ? "border-amber-500 bg-amber-500/10 text-amber-500 font-bold ring-2 ring-amber-500/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">NetBanking</span>
                </button>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                256-Bit SSL Encrypted Mock Gateway. Safe transaction sandbox.
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                isLoading={isProcessing}
                onClick={handlePay}
                className="font-bold"
              >
                Authorize & Pay {formatCurrency(invoice.amount)}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
