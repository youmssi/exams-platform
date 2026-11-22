/**
 * Product events, sent to Umami when its script is loaded (production only).
 * Names are `<object>_<past-tense verb>`, in snake_case; see docs/analytics.md.
 */
export type AnalyticsEvent =
  | { name: "auth_started"; data: { method: AuthMethod } }
  | { name: "auth_completed"; data: { method: AuthMethod } }
  | { name: "request_published"; data: { count: number; bonus: number } }
  | { name: "request_claimed"; data: { bonus: number } }
  | { name: "operation_released"; data?: never }
  | { name: "candidate_withdrew"; data?: never }
  | { name: "reservation_declared"; data?: never }
  | { name: "mail_confirmed"; data?: never }
  | { name: "booking_disputed"; data?: never };

type AuthMethod = "code" | "password" | "google" | "microsoft";

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, string | number>) => void;
    };
  }
}

export function track({ name, data }: AnalyticsEvent) {
  window.umami?.track(name, data);
}
