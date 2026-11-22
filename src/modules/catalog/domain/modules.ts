/**
 * Modules booked for a request. The price does not depend on them: an assistant books
 * the same way for one module or the full exam.
 */

/** The chosen modules in the offer's order, or null when the choice is empty or unknown. */
export function bookedModules(
  offerModules: readonly string[],
  chosen: readonly string[],
): string[] | null {
  if (!chosen.length || chosen.some((module) => !offerModules.includes(module)))
    return null;
  return offerModules.filter((module) => chosen.includes(module));
}

/** Whether the booked modules cover the whole exam. */
export function isFullExam(
  offerModules: readonly string[],
  booked: readonly string[],
): boolean {
  return offerModules.every((module) => booked.includes(module));
}
