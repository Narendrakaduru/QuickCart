const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const port = parseInt(process.env.SMTP_PORT, 10);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,       // true only for SSL (465)
    requireTLS: port === 587,   // force STARTTLS upgrade on port 587 (Gmail)
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`[Email] Sent to ${options.email} | ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[Email] SMTP send failed!');
    console.error(`  To      : ${options.email}`);
    console.error(`  Subject : ${options.subject}`);
    console.error(`  Host    : ${process.env.SMTP_HOST}:${port}`);
    console.error(`  User    : ${process.env.SMTP_EMAIL}`);
    console.error(`  Error   : ${error.message}`);
    throw error;   // always propagate so the API returns the real failure
  }
};

module.exports = sendEmail;
