/**
 * The logo mark as standalone SVG, for generated images (Open Graph, Apple icon).
 * `src/app/icon.svg` holds the same markup; a test keeps them identical.
 */
export const LOGO_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#171717"/>
  <path d="M8 13V9.5A1.5 1.5 0 0 1 9.5 8H13M24 19v3.5a1.5 1.5 0 0 1-1.5 1.5H19" fill="none" stroke="#fafafa" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="m11.5 16.5 3 3 6-7" fill="none" stroke="#fafafa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

export const LOGO_MARK_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(LOGO_MARK_SVG).toString("base64")}`;
