/** Public server API of the `beneficiaries` module. */
export { MAX_BENEFICIARIES } from "./domain/limits";
export { displayName, isReadyToBook } from "./domain/profile";
export { beneficiariesRouter } from "./server/router";
export { isSelfReady } from "./server/service";
export { Beneficiaries } from "./ui/beneficiaries";
export { SelfProfileCard } from "./ui/self-profile-card";
