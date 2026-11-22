/** Queue order: higher bonus first, then the oldest request. */
export const compareQueue = (
  a: { bonus: number; publishAt: Date },
  b: { bonus: number; publishAt: Date },
) => b.bonus - a.bonus || a.publishAt.getTime() - b.publishAt.getTime();
