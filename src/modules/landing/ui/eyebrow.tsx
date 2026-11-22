import { cn } from "cn";
import type { ReactNode } from "react";

/** Mono label with a rule, above each section title. */
export function Eyebrow({
  children,
  centered = false,
  className,
}: {
  children: ReactNode;
  centered?: boolean;
  className?: string;
}) {
  const rule = <span className="h-px w-8 bg-current opacity-30" />;
  return (
    <span
      className={cn(
        "mb-6 inline-flex items-center gap-3 font-mono text-muted-foreground text-sm",
        className,
      )}
    >
      {rule}
      {children}
      {centered && rule}
    </span>
  );
}
