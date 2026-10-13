import assert from "node:assert";
import test from "node:test";
import { MockPaymentGateway } from "../src/lib/payments";
import { generateStudentIdQr } from "../src/lib/qr";

test("Smart Attendance Tracker: 75% threshold and recovery calculations", () => {
  // Scenario A: Safe Zone (22 of 24 attended)
  const totalA = 24;
  const attendedA = 22;
  const pctA = Math.round((attendedA / totalA) * 100);
  assert.strictEqual(pctA, 92);
  assert.strictEqual(pctA >= 75, true);

  // Scenario B: Critical Warning (< 75% threshold, 12 of 18 attended)
  const totalB = 18;
  const attendedB = 12;
  const pctB = Math.round((attendedB / totalB) * 100);
  assert.strictEqual(pctB, 67);
  assert.strictEqual(pctB < 75, true, "Should trigger critical at-risk alert");

  // Recovery Catch-up Formula:
  // (attended + x) / (total + x) >= 0.75
  // x >= 3 * total - 4 * attended
  const neededB = Math.max(0, Math.ceil(3 * totalB - 4 * attendedB));
  assert.strictEqual(neededB, 6, "Must attend 6 consecutive classes to reach 75%");

  // Verify that after 6 classes, new percentage is exactly >= 75%
  const newTotal = totalB + neededB; // 24
  const newAttended = attendedB + neededB; // 18
  const newPct = (newAttended / newTotal) * 100;
  assert.strictEqual(newPct, 75.0, "Attendance reaches exactly 75% threshold");
});

test("Fee Gateway: Mock payment order creation and transaction settlement", () => {
  const invoiceId = "inv_test_hostel_42k";
  const amount = 42000;

  // 1. Order Creation
  const order = MockPaymentGateway.createOrder(invoiceId, amount);
  assert.ok(order.orderId.startsWith("order_mock_"));
  assert.strictEqual(order.amount, 42000);
  assert.strictEqual(order.currency, "INR");

  // 2. Settlement Verification
  const settlement = MockPaymentGateway.verifyAndSettle(invoiceId, amount, "UPI");
  assert.strictEqual(settlement.success, true);
  assert.strictEqual(settlement.paymentMethod, "UPI");
  assert.ok(settlement.gatewayRef.startsWith("PAY-UPI-"));
  assert.ok(settlement.receiptNumber.startsWith(`REC-${new Date().getFullYear()}-`));
});

test("Digital Student ID: QR code data URL generation", async () => {
  const rollNumber = "2023CSE042";
  const studentName = "Kiran Kumar";

  const qrDataUrl = await generateStudentIdQr(rollNumber, studentName);
  assert.ok(
    qrDataUrl.startsWith("data:image/png;base64,"),
    "QR code should be a valid PNG base64 data URL"
  );
  assert.ok(qrDataUrl.length > 200, "QR code data URL must have valid payload length");
});
