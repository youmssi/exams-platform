/** Mono lines revealed one after the other; re-keyed to replay when the content changes. */
export function TerminalLines({
  id,
  lines,
  className,
}: {
  id: string | number;
  lines: string[];
  className?: string;
}) {
  return (
    <pre className={`font-mono text-sm ${className ?? ""}`}>
      {lines.map((line, index) => (
        <div
          key={`${id}-${line}`}
          className="line-reveal leading-loose"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <span className="inline-block w-8 select-none opacity-30">
            {index + 1}
          </span>
          {line}
        </div>
      ))}
    </pre>
  );
}
