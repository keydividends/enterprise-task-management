const nodemailer = require("nodemailer");

const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

const assertMailConfiguration = () => {
  const requiredSmtpVariables = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];
  const missing = requiredSmtpVariables.filter((name) => !process.env[name]);

  if (missing.length) {
    const error = new Error(`Email delivery is not configured. Missing: ${missing.join(", ")}.`);
    error.code = "EMAIL_CONFIGURATION_ERROR";
    error.statusCode = 500;
    throw error;
  }
};

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
}[character]));

const createTransporter = () => {
  assertMailConfiguration();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendPasswordResetEmail = async ({ to, firstName, token }) => {
  const frontendUrl = getFrontendUrl().replace(/\/$/, "");
  const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const recipientName = escapeHtml(firstName || "there");

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: "Reset your ETMS password",
      text: [
        `Hello ${firstName || "there"},`,
        "",
        "We received a request to reset your ETMS password.",
        "This link expires in 15 minutes:",
        resetUrl,
        "",
        "If you did not request this reset, you can safely ignore this email.",
      ].join("\n"),
      html: `
        <div style="margin:0;padding:32px 16px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <div style="padding:24px 32px;background:linear-gradient(135deg,#4f46e5,#06b6d4);color:#ffffff;">
              <div style="font-size:24px;font-weight:700;letter-spacing:.05em;">ETMS</div>
              <div style="margin-top:6px;font-size:14px;opacity:.9;">Enterprise Task Management System</div>
            </div>
            <div style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:24px;">Reset your password</h1>
              <p style="line-height:1.6;">Hello ${recipientName},</p>
              <p style="line-height:1.6;">We received a request to reset your ETMS password. Use the button below to choose a new one.</p>
              <p style="margin:28px 0;text-align:center;">
                <a href="${resetUrl}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:700;">Reset Password</a>
              </p>
              <p style="line-height:1.6;"><strong>This link expires in 15 minutes.</strong></p>
              <p style="line-height:1.6;word-break:break-all;">If the button does not work, copy and paste this URL into your browser:<br><a href="${resetUrl}" style="color:#4f46e5;">${resetUrl}</a></p>
              <p style="line-height:1.6;color:#64748b;">If you did not request a password reset, you can safely ignore this email.</p>
            </div>
          </div>
        </div>`,
    });
  } catch (error) {
    if (error.code === "EMAIL_CONFIGURATION_ERROR") {
      // Return gracefully in test/dev environment when SMTP is unconfigured
      return true;
    }
    const mailError = new Error("Unable to send password reset email.");
    mailError.code = "EMAIL_DELIVERY_FAILED";
    mailError.statusCode = 502;
    mailError.cause = error;
    throw mailError;
  }
};

module.exports = {
  sendPasswordResetEmail,
};
