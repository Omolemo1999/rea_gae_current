import nodemailer from "nodemailer";

const configured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

const transporter = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    })
  : null;

const appUrl = process.env.APP_URL || "http://localhost:3000";
const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@reagae.local";

async function send(to: string, subject: string, html: string) {
  if (!transporter) {
    console.info(`[email:development] To=${to} Subject=${subject}\n${html}`);
    return { delivered: false, development: true };
  }
  return transporter.sendMail({ from, to, subject, html });
}

export async function sendVerificationEmail(to: string, firstName: string, token: string) {
  const url = `${appUrl}/verify?token=${encodeURIComponent(token)}`;
  return send(to, "Verify your ReaGae email", `<p>Hi ${escapeHtml(firstName)},</p><p>Verify your ReaGae account:</p><p><a href="${url}">Verify email</a></p><p>This link expires in 24 hours.</p>`);
}

export async function sendPasswordResetEmail(to: string, firstName: string, token: string) {
  const url = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  return send(to, "Reset your ReaGae password", `<p>Hi ${escapeHtml(firstName)},</p><p>We received a password reset request.</p><p><a href="${url}">Reset password</a></p><p>This link expires in 15 minutes.</p>`);
}

export async function sendBookingEmail(to: string, firstName: string, subject: string, message: string) {
  return send(to, subject, `<p>Hi ${escapeHtml(firstName)},</p><p>${escapeHtml(message)}</p><p>ReaGae</p>`);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] || char);
}
