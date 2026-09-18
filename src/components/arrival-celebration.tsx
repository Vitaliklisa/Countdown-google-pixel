import { useEffect, useMemo, useState } from "react";
import { CheckIcon } from "lucide-animated";
import { cn } from "@/lib/utils";

type Piece = {
  id: number;
  left: number;
  drift: number;
  spin: number;
  duration: number;
  delay: number;
  width: number;
  height: number;
  radius: string;
  shape: "bar" | "chip" | "dot";
  color: string;
};

/**
 * Palette for the celebration — pulled from the accent plus two fixed party
 * hues, so it reads as confetti and not as a second product accent.
 */
const PARTY_COLORS = ["var(--color-accent)", "#e8b64c", "#e0709a", "#7cc4e8", "#f0f1ee"];

function usePieces(count: number): Piece[] {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    setSeed(1);
  }, []);
  return useMemo(() => {
    // Deterministic pseudo-random so SSR and the first client paint agree.
    let s = 1337 + seed * 7919;
    const rand = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    return Array.from({ length: count }, (_, id) => {
      const shape: Piece["shape"] = id % 5 === 0 ? "chip" : id % 3 === 0 ? "dot" : "bar";
      return {
        id,
        left: rand() * 100,
        drift: (rand() - 0.5) * 220,
        spin: 180 + rand() * 900 * (rand() > 0.5 ? 1 : -1),
        duration: 2.8 + rand() * 2.6,
        delay: rand() * 1.6,
        width: shape === "bar" ? 6 + rand() * 6 : 9 + rand() * 6,
        height: shape === "bar" ? 14 + rand() * 12 : 9 + rand() * 6,
        radius: shape === "dot" ? "9999px" : shape === "chip" ? "2px" : "9999px",
        shape,
        color: PARTY_COLORS[id % PARTY_COLORS.length],
      };
    });
  }, [count, seed]);
}

/**
 * The moment the countdown hits zero. Renders a celebratory burst: a repeating
 * confetti field, an expanding ring, an animated check icon, and the event's
 * own title/description as the punchline.
 */
export function ArrivalCelebration({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  const pieces = usePieces(80);

  return (
    <div
      className={cn("relative isolate overflow-hidden rounded-lg", className)}
      role="status"
      aria-live="polite"
    >
      {/*
        The burst is `fixed`, not confined to the card: confetti that only falls
        inside a short card is clipped out of sight before it can be seen. As a
        screen-level layer it rains over the whole app, which is the moment.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      >
        {pieces.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece absolute top-0 block"
            style={{
              left: `${piece.left}%`,
              width: `${piece.width}px`,
              height: `${piece.height}px`,
              borderRadius: piece.radius,
              background: piece.color,
              ["--drift" as string]: `${piece.drift}px`,
              ["--spin" as string]: `${piece.spin}deg`,
              ["--duration" as string]: `${piece.duration}s`,
              ["--delay" as string]: `${piece.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex-col items-center gap-3 px-6 py-8 text-center">
        <span className="relative inline-flex size-16 items-center justify-center">
          <span
            aria-hidden="true"
            className="ring-pop absolute inset-0 rounded-full border-2 border-accent"
          />
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <CheckIcon size={30} className="text-accent" />
          </span>
        </span>
        {/* The title and description already sit in the header right above, so
            this card carries the moment rather than repeating the details. */}
        <span className="text-xs font-medium tracking-label text-accent uppercase">
          The day has come
        </span>
        <p className="max-w-xs text-sm text-muted">
          {title} is here{description ? ` — ${description}` : " — enjoy every minute of it."}
        </p>
      </div>
    </div>
  );
}
