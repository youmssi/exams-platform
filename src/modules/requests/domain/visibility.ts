/**
 * A request is created ahead of time and becomes visible to assistants when registrations open.
 * Published requests are those whose `publishAt` has passed.
 */
export type RequestVisibility = "scheduled" | "published";

export const requestVisibility = (
  publishAt: Date,
  now = new Date(),
): RequestVisibility => (publishAt <= now ? "published" : "scheduled");

/** Publish now, or when registrations open if that is later. */
export const publishAtFor = (registrationOpensAt: Date, now = new Date()) =>
  registrationOpensAt > now ? registrationOpensAt : now;
