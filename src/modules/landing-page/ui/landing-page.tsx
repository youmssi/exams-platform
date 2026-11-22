import "./landing.css";
import { Suspense } from "react";
import { MAX_BENEFICIARIES } from "@/modules/beneficiaries";
import { getSession } from "@/modules/identity";
import { getLandingOffers, publicRules } from "../server/data";
import { AssistantsSection } from "./assistants-section";
import { CentersSection } from "./centers-section";
import { CtaSection } from "./cta-section";
import { FaqSection } from "./faq-section";
import { FeaturesSection } from "./features-section";
import { landingFonts } from "./fonts";
import { FooterSection } from "./footer-section";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { Navigation } from "./navigation";
import { PaymentsSection } from "./payments-section";
import { PricingSection } from "./pricing-section";
import { RulesSection } from "./rules-section";
import { SecuritySection } from "./security-section";

async function SignedInNavigation() {
  return <Navigation signedIn={Boolean(await getSession())} />;
}

async function SignedInHero() {
  return (
    <HeroSection
      signedIn={Boolean(await getSession())}
      maxPeople={MAX_BENEFICIARIES}
    />
  );
}

/** Centres, rules in numbers, FAQ and prices: everything read from the catalogue. */
async function CatalogSections({ part }: { part: "overview" | "pricing" }) {
  const offers = await getLandingOffers();
  const rules = publicRules(offers);
  if (part === "pricing") {
    return (
      <>
        {rules && (
          <FaqSection
            claimMinutes={rules.claim}
            others={MAX_BENEFICIARIES - 1}
          />
        )}
        <PricingSection offers={offers} />
      </>
    );
  }
  return (
    <>
      <CentersSection offers={offers} />
      {rules && <RulesSection rules={{ ...rules, group: MAX_BENEFICIARIES }} />}
    </>
  );
}

/**
 * Public landing page. The static shell is prerendered; the session and the catalogue
 * stream in, with the signed-out and empty states as fallbacks.
 */
export function LandingPage() {
  return (
    <main
      className={`landing ${landingFonts} noise-overlay relative min-h-svh overflow-x-hidden font-sans`}
    >
      <Suspense fallback={<Navigation signedIn={false} />}>
        <SignedInNavigation />
      </Suspense>
      <Suspense
        fallback={
          <HeroSection signedIn={false} maxPeople={MAX_BENEFICIARIES} />
        }
      >
        <SignedInHero />
      </Suspense>
      <FeaturesSection maxPeople={MAX_BENEFICIARIES} />
      <HowItWorksSection />
      <Suspense>
        <CatalogSections part="overview" />
      </Suspense>
      <PaymentsSection />
      <SecuritySection />
      <AssistantsSection />
      <Suspense>
        <CatalogSections part="pricing" />
      </Suspense>
      <CtaSection />
      <FooterSection />
    </main>
  );
}
