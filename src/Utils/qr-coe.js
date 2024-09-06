import QRCode from "qrcode";

export async function generateQrCode  (data) {
  const qrCode = QRCode.toDataURL([JSON.stringify(data)], {
    errorCorrectionLevel: "H",
  });
    return qrCode;
}