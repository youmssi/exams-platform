"use client";

import { useEffect, useState } from "react";
import { OTP_RESEND_AFTER_SECONDS } from "../schemas";

/** Seconds left before a new code can be requested; restart after each send. */
export function useResendCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_AFTER_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return {
    secondsLeft,
    canResend: secondsLeft <= 0,
    restart: () => setSecondsLeft(OTP_RESEND_AFTER_SECONDS),
  };
}
