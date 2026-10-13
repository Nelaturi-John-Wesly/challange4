import { requireAuth } from "@/lib/auth";
import { MockPaymentGateway } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { invoiceId, paymentMethod = "UPI" } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId is required." }, { status: 400 });
    }

    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    // Role check: Only the invoice owner student or admin can pay
    if (user.role === "STUDENT" && invoice.studentId !== user.id) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice is already paid." }, { status: 400 });
    }

    // Process through Mock Payment Gateway
    const settlement = MockPaymentGateway.verifyAndSettle(
      invoice.id,
      invoice.amount,
      paymentMethod
    );

    // Update invoice and record transaction
    const [updatedInvoice] = await prisma.$transaction([
      prisma.feeInvoice.update({
        where: { id: invoice.id },
        data: {
          status: "PAID",
          receiptNumber: settlement.receiptNumber,
          paidAt: settlement.paidAt,
          paymentMethod: settlement.paymentMethod,
        },
      }),
      prisma.paymentTransaction.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.amount,
          gatewayRef: settlement.gatewayRef,
          status: "SUCCESS",
          paymentMethod: settlement.paymentMethod,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      receiptNumber: updatedInvoice.receiptNumber,
      paidAt: updatedInvoice.paidAt,
      invoiceId: updatedInvoice.id,
      message: "Payment successfully processed and verified.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
