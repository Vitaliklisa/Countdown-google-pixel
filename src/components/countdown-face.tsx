import { pad2, remainingUntil, type Remaining } from "@/lib/countdown";
import { cn } from "@/lib/utils";

const UNITS = [
  { key: "years", label: "Years" },
  { key: "months", label: "Months" },
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
] as const;

function UnitTile({ value, label, live }: { value: number; label: string; live: boolean }) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-md border-border bg-surface px-3 py-4 transition-colors duration-(--motion-fast)",
        live && "tile-live border-accent/40",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent",
          live ? "via-accent/70" : "via-border-strong",
        )}
      />
      <span
        className={cn(
          "font-display text-stat tabular-nums",
          // A zero reads as "nothing left here", so it recedes instead of
          // competing with the units that still carry the countdown.
          value === 0 ? "text-subtle" : "text-fg",
        )}
      >
        {pad2(value)}
      </span>
      <span
        className={cn(
          "mt-1.5 text-xs font-medium tracking-label uppercase",
          live ? "text-accent" : "text-subtle",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function CountdownFace({
  target,
  now,
  className,
}: {
  target: Date;
  now: Date;
  className?: string;
}) {
  const remaining: Remaining = remainingUntil(target, now);

  if (remaining.isPast) return null;

  // The unit that is still visibly ticking takes the accent halo — usually
  // hours, but a closer event highlights days or months instead.
  const liveUnit = remaining.hours > 0 ? "hours" : remaining.days > 0 ? "days" : "months";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="grid grid-cols-2 gap-3">
        {UNITS.map((unit) => (
          <UnitTile
            key={unit.key}
            value={remaining[unit.key]}
            label={unit.label}
            live={unit.key === liveUnit}
          />
        ))}
      </div>
      <p className="flex items-center justify-center gap-2 text-sm tabular-nums text-muted">
        <span aria-hidden="true" className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
        </span>
        {pad2(remaining.minutes)} min · {pad2(remaining.seconds)} sec remaining
      </p>
    </div>
  );
}
