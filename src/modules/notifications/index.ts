/** Public server API of the `notifications` module: the only place that sends product emails. */
export { notificationsRouter } from "./server/router";
export {
  type NotificationInput,
  notify,
  rememberLocale,
} from "./server/service";
export { EmailPreferencesCard } from "./ui/email-preferences-card";
export { NotificationCenter } from "./ui/notification-center";
