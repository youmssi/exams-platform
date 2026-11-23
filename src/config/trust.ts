/** Trust rules (spec §9). Changing a value here changes it everywhere. */
export const trustConfig = {
  /** Active strikes that suspend an account until an admin lifts it. */
  strikesToSuspend: 3,
  /** Hours the assistant has to send a proof once a booking is disputed. */
  proofDeadlineH: 12,
  /** Largest proof or identity image accepted, in bytes. */
  imageMaxBytes: 5 * 1024 * 1024,
  /** Image types accepted for proofs and identity documents. */
  imageTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
} as const;
