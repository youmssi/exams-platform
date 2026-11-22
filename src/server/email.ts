import "server-only";
import { render } from "@react-email/components";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { env } from "./env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type Email = { to: string; subject: string; react: ReactElement };

/**
 * Single entry point for outgoing email.
 * The template is rendered here (HTML + plain text) rather than by the Resend SDK,
 * whose lazy renderer is not resolvable once bundled.
 * Without an API key (local development), the email is logged instead.
 */
export async function sendEmail({ to, subject, react }: Email) {
  const [html, text] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ]);

  if (!resend) {
    if (env.NODE_ENV === "production")
      throw new Error("RESEND_API_KEY is required in production");
    console.info(`[email] to=${to} subject="${subject}"\n${text}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });
  if (error) throw new Error(`Email not sent: ${error.message}`);
}
