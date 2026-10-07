import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export async function sendVerificationEmail(toEmail: string, token: string, fullName: string): Promise<void> {
  const verifyUrl = `${config.clientOrigin}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"UOL Ride Share" <${config.smtp.user}>`,
    to: toEmail,
    subject: 'Verify your UOL Ride Share account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">UOL Ride Share</h2>
        <p>Hi ${fullName},</p>
        <p>Welcome to UOL Ride Share! Please verify your email address to activate your account.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Verify Email
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:14px;">
          This link expires in 24 hours. If you did not create an account, ignore this email.
        </p>
      </div>
    `,
  });
}
