const nodemailer = require('nodemailer');

const isConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

const sendMail = async ({ to, subject, text, html }) => {
  if (!isConfigured || !transporter || !to) {
    return { sent: false, reason: 'mailer-not-configured' };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    return { sent: true };
  } catch (error) {
    console.error('Mail send error:', error.message);
    return { sent: false, reason: 'send-failed' };
  }
};

module.exports = { sendMail, isMailerConfigured: isConfigured };
