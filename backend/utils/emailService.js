const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

const initTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📧 Email service configured');
  } else {
    console.log('📧 Email service not configured (SMTP credentials missing) — emails will be skipped');
  }
};

const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  if (!transporter) {
    console.log(`📧 [SKIPPED] Booking confirmation email to ${userEmail}`);
    return { skipped: true };
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@eventmanager.com',
      to: userEmail,
      subject: `🎉 Booking Confirmed — ${bookingDetails.eventTitle}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a1a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">🎫 Booking Confirmed!</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #a78bfa; margin-top: 0;">${bookingDetails.eventTitle}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Booking ID:</td>
                <td style="padding: 8px 0; color: #e2e8f0; font-family: monospace;">${bookingDetails.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Event Date:</td>
                <td style="padding: 8px 0; color: #e2e8f0;">${new Date(bookingDetails.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Location:</td>
                <td style="padding: 8px 0; color: #e2e8f0;">${bookingDetails.location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Tickets:</td>
                <td style="padding: 8px 0; color: #e2e8f0;">${bookingDetails.numberOfTickets}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding: 16px; background: #1e1b4b; border-radius: 8px; text-align: center;">
              <p style="color: #a78bfa; margin: 0 0 8px 0;">Your QR Code is available in your dashboard</p>
              <p style="color: #64748b; margin: 0; font-size: 12px;">Show this QR code at the event entrance for entry</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${userEmail}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('📧 Email send error:', error.message);
    return { sent: false, error: error.message };
  }
};

initTransporter();

module.exports = { sendBookingConfirmation };
