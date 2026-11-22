import "server-only";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { env } from "./env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type Email = { to: string; subject: string; react: ReactElement };

/**
 * Single entry point for outgoing email.
 * Without an API key (local development), the email is logged instead.
 */
export async function sendEmail({ to, subject, react }: Email) {
  if (!resend) {
    if (env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is required in production");
    }
    const { render } = await import("@react-email/components");
    const text = await render(react, { plainText: true });
    console.info(`[email] to=${to} subject="${subject}"\n${text}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    react,
  });
  if (error) throw new Error(`Email not sent: ${error.message}`);
}
