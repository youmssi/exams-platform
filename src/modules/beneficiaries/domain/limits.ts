/** An account books for itself and up to four friends (product decision, docs/product/spec.md §5). */
export const MAX_BENEFICIARIES = 5;

export const canAddBeneficiary = (count: number) => count < MAX_BENEFICIARIES;
