/**
 * Carry-over of requests nobody booked (EXM-022): once its session has passed, a request moves to
 * the next session of the same centre and level, with the same person, modules and bonus.
 */
type Session = { id: string; examDate: Date; verifiedAt: Date | null };

const today = (now: Date) => new Date(now.toISOString().slice(0, 10));

/** Exam dates are calendar days: a session is past from the day after its exam. */
export const isPastSession = (examDate: Date, now = new Date()) =>
  examDate < today(now);

/** Later sessions of the same offer that are still to come, soonest first. */
export const laterSessions = <T extends Session>(
  sessions: T[],
  after: Date,
  now = new Date(),
) =>
  sessions
    .filter(
      (session) =>
        session.examDate > after && !isPastSession(session.examDate, now),
    )
    .sort((a, b) => a.examDate.getTime() - b.examDate.getTime());

/** Automatic carry-over only goes to a confirmed session, never to an unverified one. */
export const autoCarryTarget = <T extends Session>(
  sessions: T[],
  after: Date,
  now = new Date(),
) =>
  laterSessions(sessions, after, now).find((session) => session.verifiedAt) ??
  null;

/** The bonus kept, or the highest one the offer still allows below it. */
export const carriedBonus = (
  bonus: number,
  offer: { bonusStep: number; bonusCap: number },
) =>
  Math.min(
    Math.floor(bonus / offer.bonusStep) * offer.bonusStep,
    offer.bonusCap,
  );
