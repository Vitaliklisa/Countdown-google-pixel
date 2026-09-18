import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  CalendarDaysIcon,
  ClockIcon,
  HistoryIcon,
  HourglassIcon,
  type ClockIconHandle,
  PartyPopperIcon,
  PlusIcon,
  SparklesIcon,
  UserIcon,
  LogoutIcon,
} from "lucide-animated";
import { pickFeatured, type CountdownEvent } from "@/lib/events";
import { useNow } from "@/hooks/use-now";
import { useEventStore } from "@/store/events";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CountdownFace } from "@/components/countdown-face";
import { EventComposer } from "@/components/event-composer";
import { ArrivalCelebration } from "@/components/arrival-celebration";
import { InvitationsBanner } from "@/components/invitations-banner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type View = "home" | "compose";

function BrandMark() {
  const clock = useRef<ClockIconHandle>(null);

  // Greet the user with the clock sweep, once, on mount.
  useEffect(() => {
    const handle = clock.current;
    if (!handle) return;
    handle.startAnimation();
    const id = window.setTimeout(() => handle.stopAnimation(), 1200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="flex items-center gap-2 text-muted">
      <ClockIcon ref={clock} size={19} animateOnHover className="text-accent" />
      <span className="text-xs font-medium tracking-brand text-fg uppercase">Until</span>
    </div>
  );
}

function EventRow({
  event,
  active,
  now,
  onSelect,
}: {
  event: CountdownEvent;
  active: boolean;
  now: Date;
  onSelect: () => void;
}) {
  const past = new Date(event.at).getTime() <= now.getTime();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-h-14 w-full items-center justify-between gap-3 rounded-md px-4 py-3 text-left transition-colors duration-(--motion-quick)",
        active ? "bg-surface-2" : "bg-surface hover:bg-surface-2",
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-fg">{event.title}</span>
        <span className="block truncate text-xs text-muted">
          {format(new Date(event.at), "MMM d, yyyy · h:mm a")}
        </span>
      </span>
      <span
        className={cn(
          "flex shrink-0 items-center gap-1.5 text-xs",
          past ? "text-accent" : "text-subtle",
        )}
      >
        {past ? <HistoryIcon size={13} /> : <CalendarDaysIcon size={13} />}
        {past ? "Passed" : "Upcoming"}
      </span>
    </button>
  );
}

function EmptyState({ onCompose }: { onCompose: () => void }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* No header here: HomeView already renders the brand row (with the
          user button) above this section. A BrandMark here duplicated it. */}
      <div className="flex flex-1 flex-col justify-center gap-5 px-6 pb-8">
        <span className="app-rise inline-flex size-14 items-center justify-center rounded-lg bg-surface text-accent">
          <HourglassIcon size={26} className="text-accent" />
        </span>
        <h1 className="app-rise app-rise-2 font-display text-4xl leading-tight tracking-tight text-fg">
          Name a day.
        </h1>
        <p className="app-rise app-rise-3 max-w-xs text-base text-muted">
          Pick a future moment — a wedding, a launch, a trip home. Until counts the years, months,
          days and hours left, then celebrates when it arrives.
        </p>
      </div>

      <div className="px-6 pb-[var(--app-inset-bottom)]">
        <Button className="w-full" onClick={onCompose}>
          <PlusIcon size={18} className="text-accent-fg" />
          Create event
        </Button>
      </div>
    </section>
  );
}

function UserButton() {
  const { user } = useCurrentUserState();

  if (!user) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link to="/login" className="flex items-center gap-2">
          <UserIcon size={16} />
          <span>Sign in</span>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="size-8">
            <AvatarImage src={user.profileImageUrl ?? undefined} />
            <AvatarFallback className="bg-surface-2 text-[10px] font-medium text-muted">
              {user.displayName?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="flex flex-col px-2 py-1.5">
          <span className="truncate text-xs font-medium text-fg">{user.displayName}</span>
          <span className="truncate text-[10px] text-muted">{user.primaryEmail}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut("/")} className="text-danger">
          <LogoutIcon size={14} className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HomeView({
  featured,
  events,
  now,
  onCompose,
  onEdit,
  onSelect,
  onInviteAccepted,
}: {
  featured: CountdownEvent | null;
  events: CountdownEvent[];
  now: Date;
  onCompose: () => void;
  onEdit: () => void;
  onSelect: (id: string) => void;
  onInviteAccepted: () => void;
}) {
  const others = featured ? events.filter((event) => event.id !== featured.id) : events;

  if (!featured) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-6 pt-[var(--app-inset-top)] pb-2">
          <BrandMark />
          <UserButton />
        </header>
        <div className="px-6 pb-2">
          <InvitationsBanner onAccepted={onInviteAccepted} />
        </div>
        <EmptyState onCompose={onCompose} />
      </div>
    );
  }

  const target = new Date(featured.at);
  const arrived = target.getTime() <= now.getTime();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        aria-hidden="true"
        className="glow-drift pointer-events-none absolute -top-24 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
      />

      <header className="relative z-10 flex items-center justify-between px-6 pt-[var(--app-inset-top)] pb-4">
        <BrandMark />
        <div className="flex items-center gap-2">
          <UserButton />
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit event">
            <SparklesIcon size={18} />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto px-6">
        {/* Pending shared-event invites, above the countdown when present. */}
        <div className="pb-4">
          <InvitationsBanner onAccepted={onInviteAccepted} />
        </div>
        {/* lucide-animated renders a <div>, so these icons cannot sit inside a <p>. */}
        <div className="flex items-center gap-2 text-xs font-medium tracking-label text-subtle uppercase">
          {arrived ? (
            <>
              <PartyPopperIcon size={14} className="text-accent" />
              Arrived
            </>
          ) : (
            <>
              <HourglassIcon size={14} />
              Counting down
            </>
          )}
        </div>
        <h1 className="app-rise mt-2 font-display text-3xl leading-tight tracking-tight text-fg">
          {featured.title}
        </h1>
        {featured.description ? (
          <p className="app-rise app-rise-2 mt-2 text-sm text-muted">{featured.description}</p>
        ) : null}
        <p className="mt-3 text-sm text-subtle">{format(target, "EE, MMMM d, yyyy · h:mm a")}</p>

        {arrived ? (
          <ArrivalCelebration
            title={featured.title}
            description={featured.description}
            className="mt-6 bg-surface"
          />
        ) : (
          <CountdownFace target={target} now={now} className="mt-7" />
        )}

        {others.length > 0 ? (
          <div className="mt-8 mb-4">
            <p className="mb-3 text-xs font-medium tracking-label text-subtle uppercase">
              Other events
            </p>
            <ul className="flex flex-col gap-2">
              {others.map((event) => (
                <li key={event.id}>
                  <EventRow
                    event={event}
                    active={false}
                    now={now}
                    onSelect={() => onSelect(event.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      <div className="sticky bottom-0 mt-4 bg-bg/95 px-6 pt-3 pb-[var(--app-inset-bottom)] backdrop-blur">
        <Button className="w-full" onClick={onCompose}>
          <PlusIcon size={18} className="text-accent-fg" />
          New event
        </Button>
      </div>
    </div>
  );
}

export function UntilApp() {
  const now = useNow(1000);
  const { user, isPending } = useCurrentUserState();
  const {
    events,
    selectedId,
    hydrated,
    loading,
    hydrate,
    refresh,
    addEvent,
    updateEvent,
    removeEvent,
    selectEvent,
  } = useEventStore();
  const [view, setView] = useState<View>("home");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending) {
      hydrate(user?.id);
    }
  }, [hydrate, user?.id, isPending]);

  // Keep every signed-in device converged: re-fetch on an interval and when the
  // tab/app regains focus, so an edit made on another device (or by another
  // participant) shows up here without a manual reload. Silent — no spinner.
  useEffect(() => {
    if (isPending || !user?.id) return;
    const POLL_MS = 20_000;
    const id = window.setInterval(() => void refresh(user.id), POLL_MS);
    const onFocus = () => void refresh(user.id);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh, user?.id, isPending]);

  // Register this device for push once signed in. No-op in a browser — only the
  // native shell (Capacitor) has the runtime; see src/lib/push.ts.
  useEffect(() => {
    if (isPending || !user?.id) return;
    let cancelled = false;
    void (async () => {
      const { registerPush } = await import("@/lib/push");
      if (cancelled) return;
      try {
        await registerPush();
      } catch (err) {
        // A push failure must never break the app — log and carry on.
        console.warn("[push] registration failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isPending]);

  const featured = useMemo(
    () => pickFeatured(events, selectedId, now),
    [events, selectedId, now],
  );

  const editing = editingId ? (events.find((event) => event.id === editingId) ?? null) : null;

  if (!hydrated || isPending || loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <ClockIcon size={32} className="animate-spin text-accent/50" />
      </div>
    );
  }

  if (view === "compose") {
    return (
      <EventComposer
        event={editing}
        now={now}
        onClose={() => {
          setView("home");
          setEditingId(null);
        }}
        onSave={async (draft) => {
          if (editing) {
            await updateEvent(editing.id, draft, user?.id);
          } else {
            await addEvent(draft, user?.id);
          }
          setView("home");
          setEditingId(null);
        }}
        onDelete={
          editing
            ? async () => {
                await removeEvent(editing.id, user?.id);
                setView("home");
                setEditingId(null);
              }
            : undefined
        }
      />
    );
  }

  return (
    <HomeView
      featured={featured}
      events={events}
      now={now}
      onInviteAccepted={() => {
        if (user?.id) void refresh(user.id);
      }}
      onCompose={() => {
        setEditingId(null);
        setView("compose");
      }}
      onEdit={() => {
        if (!featured) return;
        setEditingId(featured.id);
        setView("compose");
      }}
      onSelect={(id) => selectEvent(id)}
    />
  );
}
