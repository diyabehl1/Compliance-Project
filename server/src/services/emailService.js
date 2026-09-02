import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.info("[email skipped]", { to, subject });
    return { skipped: true };
  }
  await t.sendMail({
    from: process.env.EMAIL_FROM || "CompliNova AI <noreply@complinova.ai>",
    to,
    subject,
    html,
    text,
  });
  return { sent: true };
}

export async function sendVerificationEmail(email, token) {
  const base = process.env.CLIENT_URL || "http://localhost:5173";
  const link = `${base}/verify-email?token=${token}`;
  return sendMail({
    to: email,
    subject: "Verify your CompliNova AI account",
    html: `<p>Welcome to CompliNova AI.</p><p><a href="${link}">Verify email</a></p><p>If you did not register, ignore this message.</p>`,
    text: `Verify: ${link}`,
  });
}

export async function sendPasswordResetEmail(email, token) {
  const base = process.env.CLIENT_URL || "http://localhost:5173";
  const link = `${base}/reset-password?token=${token}`;
  return sendMail({
    to: email,
    subject: "Reset your CompliNova AI password",
    html: `<p>Reset your password:</p><p><a href="${link}">Reset password</a></p><p>Expires in 1 hour.</p>`,
    text: `Reset: ${link}`,
  });
}
