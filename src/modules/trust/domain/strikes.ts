/** Whether a new strike suspends the account: once active strikes reach the threshold. */
export const reachesSuspension = (activeStrikes: number, threshold: number) =>
  activeStrikes >= threshold;

/** Strikes shown as "2 of 3", never above the threshold. */
export const strikeCount = (activeStrikes: number, threshold: number) => ({
  count: Math.min(activeStrikes, threshold),
  threshold,
});
