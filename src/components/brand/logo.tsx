import { cn } from "@/lib/utils";

/** The Exams mark: an open frame around a check. Colors follow the theme tokens. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      >
        <path
          d="M8 13V9.5A1.5 1.5 0 0 1 9.5 8H13M24 19v3.5a1.5 1.5 0 0 1-1.5 1.5H19"
          strokeWidth="2.25"
        />
        <path d="m11.5 16.5 3 3 6-7" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

/** Mark and wordmark, for headers and the sign-in screen. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold text-lg tracking-tight",
        className,
      )}
    >
      <LogoMark />
      Exams
    </span>
  );
}
