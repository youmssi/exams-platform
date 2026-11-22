import Script from "next/script";

const src = process.env.NEXT_PUBLIC_UMAMI_SRC;
const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const domains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS;

/** Umami, privacy-friendly analytics. Rendered only where it is configured (production). */
export function Analytics() {
  if (!src || !websiteId) return null;
  return (
    <Script
      src={src}
      data-website-id={websiteId}
      data-domains={domains}
      strategy="afterInteractive"
    />
  );
}
