/**
 * Email sending utility via Resend.
 * Server-side only.
 */

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!resendApiKey) return null;
  if (!resend) resend = new Resend(resendApiKey);
  return resend;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const client = getResend();

  if (!client) {
    // Email service not configured — skip silently in development
    console.warn('[email] RESEND_API_KEY not set — email skipped:', options.subject);
    return { success: false, error: 'Email service not configured' };
  }

  const { data, error } = await client.emails.send({
    from: emailFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  if (error) {
    console.error('[email] Failed to send email:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, messageId: data?.id };
}
