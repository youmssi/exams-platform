import {
  ArrowDownIcon,
  ArrowRightIcon,
  CheckIcon,
  CircleDollarSignIcon,
  Clock3Icon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersRoundIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { listPublicPricing } from "@/modules/catalog";
import { getSession } from "@/modules/identity";
import BlurText from "./blur-text";

type Copy = Awaited<ReturnType<typeof getTranslations<"landing">>>;
type PricingOffer = Awaited<ReturnType<typeof listPublicPricing>>[number];

export async function LandingPage() {
  const [t, offers, session, home] = await Promise.all([
    getTranslations("landing"),
    listPublicPricing(),
    getSession(),
    getTranslations("home"),
  ]);
  const startHref = session ? routes.home : routes.signIn;
  const startLabel = session ? home("continue") : home("cta");

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href={routes.landing}
          aria-label="Exams"
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" />
          </span>
          <span className="text-xl">
            exams<span className="text-primary">.</span>
          </span>
        </Link>
        <nav
          aria-label={t("nav.label")}
          className="hidden items-center gap-8 text-sm text-muted-foreground md:flex"
        >
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            {t("nav.how")}
          </a>
          <a
            href="#security"
            className="transition-colors hover:text-foreground"
          >
            {t("nav.security")}
          </a>
          <a
            href="#pricing"
            className="transition-colors hover:text-foreground"
          >
            {t("nav.prices")}
          </a>
        </nav>
        <Button variant="outline" size="sm" render={<Link href={startHref} />}>
          {session ? startLabel : t("nav.signIn")}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
        <div className="relative z-10 flex flex-col items-start gap-7">
          <Badge
            variant="outline"
            className="h-auto gap-2 rounded-full bg-card px-3.5 py-2 text-muted-foreground shadow-sm"
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-primary"
            />
            <span className="sr-only">{t("hero.eyebrow")}</span>
            <span aria-hidden="true">
              <BlurText
                text={t("hero.eyebrow")}
                delay={45}
                stepDuration={0.3}
                blur={5}
                distance={12}
                trigger="view"
              />
            </span>
          </Badge>
          <h1 className="max-w-2xl text-balance font-semibold text-5xl leading-[1.05] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            {t("hero.title")}{" "}
            <span className="text-primary">{t("hero.accent")}</span>
          </h1>
          <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
            {t("hero.description")}
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" render={<Link href={startHref} />}>
              {session ? startLabel : t("hero.cta")}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              render={<Link href="/#how-it-works" />}
            >
              {t("hero.secondary")}
              <ArrowDownIcon data-icon="inline-end" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("hero.note")}</p>
        </div>
        <HeroVisual t={t} />
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-px px-5 py-1 sm:grid-cols-3 sm:px-8">
          <ProofItem
            icon={<CircleDollarSignIcon />}
            title={t("proof.priceTitle")}
            body={t("proof.priceBody")}
          />
          <ProofItem
            icon={<Clock3Icon />}
            title={t("proof.liveTitle")}
            body={t("proof.liveBody")}
          />
          <ProofItem
            icon={<LockKeyholeIcon />}
            title={t("proof.privateTitle")}
            body={t("proof.privateBody")}
          />
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
      >
        <SectionHeading
          kicker={t("journey.kicker")}
          title={t("journey.title")}
          body={t("journey.body")}
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {(["one", "two", "three"] as const).map((step, index) => (
            <Card
              key={step}
              className="group min-h-64 justify-between rounded-3xl p-7 transition-transform hover:-translate-y-1"
            >
              <CardHeader className="flex flex-row items-center justify-between p-0">
                <span className="text-sm font-medium text-primary">
                  0{index + 1}
                </span>
                <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                  <CheckIcon className="size-4" />
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 p-0">
                <CardTitle
                  role="heading"
                  aria-level={3}
                  className="font-semibold text-xl tracking-tight"
                >
                  {t(`journey.steps.${step}.title`)}
                </CardTitle>
                <CardDescription className="max-w-sm text-sm leading-6">
                  {t(`journey.steps.${step}.body`)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        <Alert className="mt-5 border-primary/10 bg-primary/5 text-muted-foreground">
          <UsersRoundIcon className="text-primary" />
          <AlertDescription>{t("journey.note")}</AlertDescription>
        </Alert>
      </section>

      <section id="security" className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div className="flex flex-col items-start gap-6">
            <Badge
              variant="outline"
              className="border-primary-foreground/25 text-primary-foreground/75"
            >
              {t("security.kicker")}
            </Badge>
            <h2 className="max-w-xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {t("security.title")}
            </h2>
            <p className="max-w-lg leading-7 text-primary-foreground/75">
              {t("security.body")}
            </p>
            <Button variant="secondary" render={<Link href={routes.privacy} />}>
              {t("security.cta")}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SecurityCard
              icon={<ShieldCheckIcon />}
              title={t("security.points.encrypted.title")}
              body={t("security.points.encrypted.body")}
            />
            <SecurityCard
              icon={<LockKeyholeIcon />}
              title={t("security.points.limited.title")}
              body={t("security.points.limited.body")}
            />
            <SecurityCard
              icon={<CheckIcon />}
              title={t("security.points.confirmed.title")}
              body={t("security.points.confirmed.body")}
            />
            <SecurityCard
              icon={<Clock3Icon />}
              title={t("security.points.deleted.title")}
              body={t("security.points.deleted.body")}
            />
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <SectionHeading
            kicker={t("pricing.kicker")}
            title={t("pricing.title")}
            body={t("pricing.body")}
          />
          <Card className="rounded-3xl p-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
              <div className="flex flex-col gap-1">
                <CardTitle
                  role="heading"
                  aria-level={3}
                  className="font-semibold text-lg"
                >
                  {t("pricing.cardTitle")}
                </CardTitle>
                <CardDescription>{t("pricing.cardBody")}</CardDescription>
              </div>
              <Badge variant="secondary">{t("pricing.badge")}</Badge>
            </CardHeader>
            <Separator />
            <CardContent className="px-6 sm:px-8">
              {offers.length ? (
                <ul className="divide-y">
                  {offers.map((offer) => (
                    <PriceRow key={offer.id} offer={offer} t={t} />
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-sm leading-6 text-muted-foreground">
                  {t("pricing.empty")}
                </p>
              )}
              <div className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
                {t("pricing.split")}
              </div>
            </CardContent>
            <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
              <Button
                className="w-full"
                size="lg"
                render={<Link href={startHref} />}
              >
                {session ? startLabel : t("pricing.cta")}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16">
          <div className="relative z-10 flex flex-col items-start gap-5">
            <span className="text-sm text-primary-foreground/70">
              {t("final.kicker")}
            </span>
            <h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {t("final.title")}
            </h2>
            <p className="max-w-xl leading-7 text-primary-foreground/75">
              {t("final.body")}
            </p>
            <Button
              size="lg"
              variant="secondary"
              render={<Link href={startHref} />}
            >
              {session ? startLabel : t("final.cta")}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-28 size-80 rounded-full border border-primary-foreground/15 sm:right-10 sm:top-[-10rem] sm:size-[28rem]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-16 size-60 rounded-full border border-primary-foreground/15 sm:right-20 sm:top-[-7rem] sm:size-[22rem]"
          />
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-semibold text-foreground">exams.</span>
          <p>{t("footer.note")}</p>
          <div className="flex gap-5">
            <Link href={routes.terms} className="hover:text-foreground">
              {t("footer.terms")}
            </Link>
            <Link href={routes.privacy} className="hover:text-foreground">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function HeroVisual({ t }: { t: Copy }) {
  return (
    <div className="relative mx-auto w-full max-w-[34rem] lg:mr-0">
      <div
        aria-hidden="true"
        className="absolute inset-4 rounded-[2rem] bg-primary/10 blur-3xl"
      />
      <Card className="relative rounded-[2rem] p-4 shadow-2xl shadow-primary/10 sm:p-6">
        <CardHeader className="flex flex-row items-center justify-between border-b p-0 pb-4">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-primary"
            />
            <span className="text-xs font-medium text-muted-foreground">
              {t("visual.live")}
            </span>
          </div>
          <Badge variant="outline">{t("visual.session")}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="py-7">
            <p className="text-xs text-muted-foreground">
              {t("visual.opening")}
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <p className="font-semibold text-2xl tracking-tight">
                  Goethe · B1
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Yaoundé · {t("visual.example")}
                </p>
              </div>
              <Badge variant="secondary">{t("visual.status")}</Badge>
            </div>
          </div>
          <div className="rounded-2xl bg-muted/50 p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("visual.timeline")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("visual.updated")}
              </span>
            </div>
            <ol className="flex flex-col gap-0">
              {(["published", "taken", "booked"] as const).map(
                (item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex flex-col items-center">
                      <span
                        className={`grid size-7 place-items-center rounded-full ${index < 2 ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground"}`}
                      >
                        <CheckIcon className="size-3.5" />
                      </span>
                      {index < 2 && (
                        <span className="my-1 h-8 w-px bg-primary/30" />
                      )}
                    </span>
                    <span className="flex min-h-11 flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {t(`visual.steps.${item}.title`)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t(`visual.steps.${item}.body`)}
                      </span>
                    </span>
                  </li>
                ),
              )}
            </ol>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl border p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <ShieldCheckIcon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium">{t("visual.safeTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("visual.safeBody")}
                </p>
              </div>
            </div>
            <CheckIcon className="size-4 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card className="absolute -bottom-5 -left-3 rounded-2xl px-4 py-3 shadow-lg sm:-left-8">
        <p className="text-xs text-muted-foreground">
          {t("visual.priceLabel")}
        </p>
        <p className="mt-1 text-sm font-semibold">{t("visual.priceValue")}</p>
      </Card>
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {kicker}
      </span>
      <h2 className="max-w-2xl text-balance text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
        {title}
      </h2>
      <p className="max-w-xl text-pretty leading-7 text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function ProofItem({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="border-0 bg-transparent p-2 shadow-none ring-0 sm:p-5">
      <CardContent className="flex items-start gap-4 p-0">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="gap-5 rounded-2xl border-primary-foreground/15 bg-primary-foreground/5 p-5 text-primary-foreground ring-0">
      <CardHeader className="gap-5 p-0">
        <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/10 text-primary-foreground">
          {icon}
        </span>
        <h3 className="font-medium">{title}</h3>
      </CardHeader>
      <CardContent className="p-0">
        <CardDescription className="leading-6 text-primary-foreground/75">
          {body}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function PriceRow({ offer, t }: { offer: PricingOffer; t: Copy }) {
  const amount = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: offer.center.country.currency,
    maximumFractionDigits: 0,
  }).format(offer.standardPrice);
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div>
        <p className="font-medium">
          {offer.center.name} · {offer.level}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {offer.center.city}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold">{amount}</p>
        <p className="text-xs text-muted-foreground">{t("pricing.standard")}</p>
      </div>
    </li>
  );
}
