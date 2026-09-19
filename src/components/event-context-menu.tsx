import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  CalendarPlusIcon,
  CopyIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";
import type { CountdownEvent } from "@/lib/events";
import { cn } from "@/lib/utils";

/**
 * Long-press / right-click actions for an event row.
 *
 * Radix's ContextMenu opens on **both** long-press (touch) and right-click
 * (mouse), so one implementation covers your Pixel and a desktop browser. That
 * matters here: mobile has no hover, so a hover-revealed menu would be
 * unreachable on the phone.
 *
 * Actions map to intent, not implementation:
 *   • Duplicate — clone the event, defaulting to the SAME title + one year later
 *   • Share     — Web Share API on device, clipboard fallback on desktop
 *   • Delete    — soft delete (server keeps the row; see events.api.ts)
 */
export function EventContextMenu({
  event,
  children,
  onDuplicate,
  onDelete,
  onShare,
}: {
  event: CountdownEvent;
  children: React.ReactNode;
  onDuplicate: () => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className={cn(
            "z-50 min-w-48 overflow-hidden rounded-md border-border bg-surface-2 p-1",
            "shadow-lg backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        >
          <Item onSelect={onShare} icon={<Share2Icon size={15} />}>
            Share event
          </Item>
          <Item onSelect={onDuplicate} icon={<CopyIcon size={15} />}>
            Duplicate
          </Item>
          <ContextMenu.Separator className="my-1 h-px bg-border" />
          <Item onSelect={onDelete} icon={<Trash2Icon size={15} />} danger>
            Delete
          </Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function Item({
  children,
  icon,
  onSelect,
  danger,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
}) {
  return (
    <ContextMenu.Item
      onSelect={onSelect}
      className={cn(
        // min-h-11 keeps the row at Android's 44-48dp touch-target guidance.
        "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm px-3 text-sm outline-none",
        danger
          ? "text-danger data-[highlighted]:bg-danger/15"
          : "text-fg data-[highlighted]:bg-surface",
      )}
    >
      <span className={danger ? "text-danger" : "text-muted"}>{icon}</span>
      {children}
    </ContextMenu.Item>
  );
}

/**
 * Clone an event as a new one. Kept title-identical (a duplicate is a copy, not
 * a rename) with the date pushed out one year so the copy is still upcoming
 * rather than instantly "arrived", which is the common intent for re-using a
 * recurring occasion.
 */
export function duplicateDraft(event: CountdownEvent): {
  title: string;
  description: string;
  at: string;
} {
  const next = new Date(event.at);
  next.setFullYear(next.getFullYear() + 1);
  return {
    title: event.title,
    description: event.description ?? "",
    at: next.toISOString(),
  };
}

/**
 * Share an event. Uses the native share sheet where available (Android/iOS,
 * and Safari), falling back to the clipboard on desktop. Always resolves — a
 * declined share or a blocked clipboard must not look like a crash.
 */
export async function shareEvent(event: CountdownEvent): Promise<"shared" | "copied" | "failed"> {
  const when = new Date(event.at).toLocaleString();
  const text = `${event.title} — ${when}`;
  const url = typeof window !== "undefined" ? window.location.origin : "";

  const nav = typeof navigator !== "undefined" ? navigator : undefined;

  if (nav?.share) {
    try {
      await nav.share({ title: event.title, text, url });
      return "shared";
    } catch (err) {
      // AbortError means the user dismissed the sheet — not a failure.
      if (err instanceof Error && err.name === "AbortError") return "shared";
      // Otherwise fall through to the clipboard.
    }
  }

  try {
    await nav?.clipboard?.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}

/** Icon re-exported so callers can render a "new event" affordance consistently. */
export { CalendarPlusIcon };
