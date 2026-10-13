import QRCode from "qrcode";

export async function generateQrDataUrl(
  text: string,
  options: QRCode.QRCodeToDataURLOptions = {}
): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    width: 280,
    ...options,
  });
}

export async function generateStudentIdQr(rollNumber: string, name: string): Promise<string> {
  const payload = JSON.stringify({
    type: "STUDENT_ID",
    roll: rollNumber,
    name,
    validUntil: "2026-06-30",
    verifiedBy: "CAMPUS_REGISTRAR",
  });
  return generateQrDataUrl(payload);
}

export async function generateTicketQr(ticketCode: string, eventId: string): Promise<string> {
  const payload = JSON.stringify({
    type: "EVENT_TICKET",
    code: ticketCode,
    eventId,
    issuedAt: new Date().toISOString(),
  });
  return generateQrDataUrl(payload);
}
