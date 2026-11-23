import { parseAsString, parseAsStringLiteral } from "nuqs";
import { OPERATION_FILTERS } from "./schemas";

/** Filters kept in the URL, so a link from the overview opens the right list. */
export const operationFilterParam =
  parseAsStringLiteral(OPERATION_FILTERS).withDefault("active");
export const userQueryParam = parseAsString.withDefault("");
