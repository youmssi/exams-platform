/**
 * Product events, sent to Umami when its script is loaded (production only).
 * Names are `<object>_<past-tense verb>`, in snake_case; see docs/analytics.md.
 */
export type AnalyticsEvent =
  | { name: "auth_started"; data: { method: AuthMethod } }
  | { name: "auth_completed"; data: { method: AuthMethod } };

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
