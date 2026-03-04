const QRCode = require("qrcode");

exports.generateQRCodeSVG = async (text) => {
  try {
    if (!text) {
      throw new Error("Text is required to generate QR code");
    }

    const svg = await QRCode.toString(text, {
      type: "svg",
      errorCorrectionLevel: "H", // High reliability
      margin: 1,
      width: 200,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return svg;
  } catch (error) {
    throw error;
  }
};

exports.generateQRCodeDataURL = async (text) => {
  try {
    if (!text) {
      throw new Error("Text is required to generate QR code");
    }

    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 200,
    });

    return dataUrl;
  } catch (error) {
    throw error;
  }
};