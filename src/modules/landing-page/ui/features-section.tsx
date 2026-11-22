"use client";

import { useTranslations } from "next-intl";
import { Eyebrow } from "./eyebrow";
import { reveal, useInView } from "./use-in-view";

/** Requests filling the queue, one after the other. */
function QueueVisual() {
  return (
    <svg viewBox="0 0 200 160" className="size-full" aria-hidden="true">
      <defs>
        <clipPath id="queue-clip">
          <rect x="30" y="20" width="140" height="120" rx="4" />
        </clipPath>
      </defs>
      <rect
        x="30"
        y="20"
        width="140"
        height="120"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <g clipPath="url(#queue-clip)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x="40"
            y={35 + i * 16}
            width="120"
            height="10"
            rx="2"
            fill="currentColor"
            opacity="0.15"
          >
            <animate
              attributeName="opacity"
              values="0.15;0.8;0.15"
              dur="2s"
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="width"
              values="20;120;20"
              dur="2s"
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
          </rect>
        ))}
      </g>
      <circle cx="100" cy="155" r="3" fill="currentColor" opacity="0.3">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

/** A candidate (C) and their assistant (A), linked one to one. */
function ExclusiveVisual() {
  return (
    <svg viewBox="0 0 200 160" className="size-full" aria-hidden="true">
      {[
        { x: 30, label: "C" },
        { x: 120, label: "A" },
      ].map(({ x, label }) => (
        <g key={label}>
          <rect
            x={x}
            y="50"
            width="50"
            height="60"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x={x + 25}
            y="85"
            textAnchor="middle"
            fontSize="20"
            fontFamily="monospace"
            fill="currentColor"
          >
            {label}
          </text>
          <circle
            cx={x + 25}
            cy="35"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </g>
      ))}
      <line
        x1="80"
        y1="80"
        x2="120"
        y2="80"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 4"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-8"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </line>
      <circle r="4" fill="currentColor">
        <animateMotion
          dur="1.5s"
          repeatCount="indefinite"
          path="M 80 80 L 120 80"
        />
      </circle>
      <circle
        cx="100"
        cy="130"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <animate
          attributeName="r"
          values="6;10;6"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

/** The account holder in the middle, their classmates around. */
function GroupVisual({ others }: { others: number }) {
  return (
    <svg viewBox="0 0 200 160" className="size-full" aria-hidden="true">
      <circle cx="100" cy="80" r="12" fill="currentColor">
        <animate
          attributeName="r"
          values="12;14;12"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      {Array.from({ length: others }, (_, i) => {
        const angle = (i * 2 * Math.PI) / others - Math.PI / 2;
        const x = 100 + Math.cos(angle) * 50;
        const y = 80 + Math.sin(angle) * 50;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: positions only.
          <g key={i}>
            <line
              x1="100"
              y1="80"
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            >
              <animate
                attributeName="opacity"
                values="0.3;0.8;0.3"
                dur="2s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </line>
            <circle
              cx={x}
              cy={y}
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <animate
                attributeName="r"
                values="6;8;6"
                dur="2s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}
      <circle
        cx="100"
        cy="80"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0"
      >
        <animate
          attributeName="r"
          values="20;60"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;0"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

/** A shield and a lock, scanned. */
function SecurityVisual() {
  return (
    <svg viewBox="0 0 200 160" className="size-full" aria-hidden="true">
      <path
        d="M 100 20 L 150 40 L 150 90 Q 150 130 100 145 Q 50 130 50 90 L 50 40 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 100 35 L 135 50 L 135 85 Q 135 115 100 128 Q 65 115 65 85 L 65 50 Z"
        fill="currentColor"
        opacity="0.1"
      >
        <animate
          attributeName="opacity"
          values="0.1;0.2;0.1"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      <rect x="85" y="70" width="30" height="25" rx="3" fill="currentColor" />
      <path
        d="M 90 70 L 90 60 Q 90 50 100 50 Q 110 50 110 60 L 110 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="100" cy="80" r="4" className="fill-background" />
      <rect x="98" y="82" width="4" height="8" className="fill-background" />
      <line
        x1="60"
        y1="60"
        x2="140"
        y2="60"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0"
      >
        <animate
          attributeName="y1"
          values="40;120;40"
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y2"
          values="40;120;40"
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;0.5;0"
          dur="3s"
          repeatCount="indefinite"
        />
      </line>
    </svg>
  );
}

const FEATURES = ["queue", "exclusive", "group", "security"] as const;

function Feature({
  id,
  index,
  others,
}: {
  id: (typeof FEATURES)[number];
  index: number;
  others: number;
}) {
  const t = useTranslations("landing.features.items");
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const visual = {
    queue: <QueueVisual />,
    exclusive: <ExclusiveVisual />,
    group: <GroupVisual others={others} />,
    security: <SecurityVisual />,
  }[id];
  return (
    <div
      ref={ref}
      className={`group ${reveal(inView, "translate-y-12")}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col gap-8 border-foreground/10 border-b py-12 lg:flex-row lg:gap-16 lg:py-20">
        <span className="shrink-0 font-mono text-muted-foreground text-sm">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="grid flex-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 font-display text-3xl transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl">
              {t(`${id}.title`)}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t(`${id}.description`, { others })}
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="h-40 w-48">{visual}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** What the platform changes, one row per promise. */
export function FeaturesSection({ maxPeople }: { maxPeople: number }) {
  const t = useTranslations("landing.features");
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <section id="features" ref={ref} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2
            className={`font-display text-4xl tracking-tight lg:text-6xl ${reveal(inView, "translate-y-4")}`}
          >
            {t("title")}
            <br />
            <span className="text-muted-foreground">{t("subtitle")}</span>
          </h2>
        </div>
        {FEATURES.map((id, index) => (
          <Feature key={id} id={id} index={index} others={maxPeople - 1} />
        ))}
      </div>
    </section>
  );
}
