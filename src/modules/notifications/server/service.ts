import "server-only";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routes } from "@/config/routes";
import type { Prisma } from "@/generated/prisma/client";
import { routing } from "@/i18n/routing";
import { publishUserChange } from "@/modules/realtime";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email";
import { env } from "@/server/env";
import {
  type NotificationTarget,
  type NotificationType,
  shouldEmail,
} from "../domain/channels";
import { NotificationEmail } from "../emails/notification-email";

export type NotificationInput = {
  userId: string;
  type: NotificationType;
  /** The page where the recipient acts on it. */
  to: NotificationTarget;
  /** Message values (reference, outcome, reason…); never personal data. */
  values?: Record<string, string>;
};

const PAGES: Record<NotificationTarget, string> = {
  requests: routes.requests,
  queue: routes.queue,
  account: routes.account,
};

/**
 * Records notifications, refreshes the recipients' open tabs and sends the emails their type calls
 * for, in each recipient's language. Called after the change is saved; never fails the caller.
 */
export async function notify(inputs: NotificationInput[]) {
  if (!inputs.length) return;
  try {
    await db.notification.createMany({
      data: inputs.map(({ userId, type, to, values }) => ({
        userId,
        type,
        data: { to, ...values } satisfies Prisma.InputJsonObject,
      })),
    });
    const recipients = await db.user.findMany({
      where: { id: { in: [...new Set(inputs.map((input) => input.userId))] } },
      select: { id: true, email: true, locale: true, emailUpdates: true },
    });
    await Promise.all([
      ...recipients.map((user) => publishUserChange(user.id)),
      ...inputs.map((input) => {
        const user = recipients.find(
          (recipient) => recipient.id === input.userId,
        );
        return user && shouldEmail(input.type, user.emailUpdates)
          ? email(user, input)
          : null;
      }),
    ]);
  } catch (error) {
    console.error("[notifications]", error);
  }
}

async function email(
  user: { email: string; locale: string },
  { type, to, values }: NotificationInput,
) {
  const locale = hasLocale(routing.locales, user.locale)
    ? user.locale
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "notifications" });
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const title = t(`types.${type}.title`, values);
  await sendEmail({
    to: user.email,
    subject: title,
    react: NotificationEmail({
      title,
      body: t(`types.${type}.body`, values),
      action: t(`actions.${to}`),
      href: `${env.APP_URL}${prefix}${PAGES[to]}`,
    }),
  });
}

/** The latest notifications and how many are unread. */
export async function listNotifications(userId: string) {
  const [items, unread] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        data: true,
        readAt: true,
        createdAt: true,
      },
    }),
    db.notification.count({ where: { userId, readAt: null } }),
  ]);
  return {
    unread,
    items: items.map(({ data, ...item }) => {
      const { to, ...values } = (data ?? {}) as Record<string, string>;
      return { ...item, to: (to ?? "requests") as NotificationTarget, values };
    }),
  };
}

export async function markAllRead(userId: string) {
  await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function emailPreferences(userId: string) {
  return db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { emailUpdates: true },
  });
}

export async function setEmailUpdates(userId: string, emailUpdates: boolean) {
  await db.user.update({ where: { id: userId }, data: { emailUpdates } });
}

/** Emails go out in the language the user last used. */
export async function rememberLocale(userId: string, locale: string) {
  await db.user.update({ where: { id: userId }, data: { locale } });
}
