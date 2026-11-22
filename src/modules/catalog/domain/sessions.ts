/** A session created by a user becomes "confirmed" after this many confirmations by other users. */
export const CONFIRMATIONS_TO_VERIFY = 3;

export const isConfirmedBy = (confirmations: number) =>
  confirmations >= CONFIRMATIONS_TO_VERIFY;
