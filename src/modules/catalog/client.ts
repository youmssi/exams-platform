"use client";

/**
 * Public client API of the `catalog` module: pure price rules and the forms other modules embed.
 * Server code imports from `@/modules/catalog`.
 */
export { bonusOptions, priceBreakdown } from "./domain/pricing";
export { CatalogRequestForm } from "./ui/catalog-request-form";
export { SessionForm } from "./ui/session-form";
