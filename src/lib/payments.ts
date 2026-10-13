/**
 * Mock Payment Gateway Interface (Razorpay/Stripe compatible)
 * Simulates real-time digital transaction settlements, webhooks, and receipts.
 */

export interface PaymentOrder {
  orderId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  gatewayRef: string;
  receiptNumber: string;
  paidAt: Date;
  paymentMethod: string;
}

export class MockPaymentGateway {
  static createOrder(invoiceId: string, amount: number): PaymentOrder {
    const orderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      orderId,
      invoiceId,
      amount,
      currency: "INR",
      keyId: "rzp_test_mock_campus_key",
    };
  }

  static verifyAndSettle(
    invoiceId: string,
    amount: number,
    paymentMethod: "UPI" | "CARD" | "NETBANKING" = "UPI"
  ): PaymentVerificationResult {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const gatewayRef = `PAY-${paymentMethod}-${Date.now().toString().slice(-6)}-${randomHex}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    return {
      success: true,
      gatewayRef,
      receiptNumber,
      paidAt: new Date(),
      paymentMethod,
    };
  }
}
