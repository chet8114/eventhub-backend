const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const qrDataString = JSON.stringify(data);
    const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = { generateQRCode };
