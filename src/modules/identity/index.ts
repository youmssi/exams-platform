/**
 * Public server API of the `identity` module.
 * Client components import from `@/modules/identity/client` instead.
 */
export { auth, enabledSocialProviders, type Session } from "./server/auth";
export { identityRouter } from "./server/router";
export {
  getSession,
  requireAdmin,
  requireOnboardedUser,
  requireUser,
} from "./server/session";
export { AccountSettings } from "./ui/account-settings";
export { OnboardingForm } from "./ui/onboarding-form";
export { ResetPasswordForm } from "./ui/reset-password-form";
export { RoleSwitch } from "./ui/role-switch";
export { SignInForm } from "./ui/sign-in-form";
