import { useMemo, useState } from "react";
import { ArrowLeftIcon, CalendarDaysIcon, CheckIcon, TimerIcon, UserRoundPlusIcon, UsersIcon } from "lucide-animated";
import { defaultComposerValues, fromLocalDateInput, toLocalDateInput, type ParticipantRole } from "@/lib/events";
import type { CountdownEvent } from "@/lib/events";
import { remainingUntil } from "@/lib/countdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { inviteUser } from "@/lib/events.api";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  event?: CountdownEvent | null;
  now: Date;
  onClose: () => void;
  onSave: (draft: { title: string; description: string; at: string }) => void;
  onDelete?: () => void;
};

/** Quick jumps for the dates people actually pick — days to years ahead. */
const PRESETS = [
  { label: "+1 week", days: 7 },
  { label: "+1 month", days: 30 },
  { label: "+1 year", days: 365 },
  { label: "+5 years", days: 1826 },
] as const;

export function EventComposer({ event, now, onClose, onSave, onDelete }: Props) {
  const initial = useMemo(() => {
    if (event) {
      const local = toLocalDateInput(event.at);
      return {
        title: event.title,
        description: event.description,
        date: local.date,
        time: local.time,
      };
    }
    const defaults = defaultComposerValues(now);
    return { title: "", description: "", date: defaults.date, time: defaults.time };
  }, [event, now]);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ParticipantRole>("viewer");
  const [inviting, setInviting] = useState(false);
  const user = useCurrentUser();

  const minDate = useMemo(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [now]);

  // Live preview of what this date actually counts down to.
  const preview = useMemo(() => {
    const when = fromLocalDateInput(date, time);
    if (!when || when.getTime() <= now.getTime()) return null;
    return remainingUntil(when, now);
  }, [date, time, now]);

  function applyPreset(days: number) {
    const next = new Date(now.getTime());
    next.setDate(next.getDate() + days);
    next.setHours(Number(time.slice(0, 2)) || 18, Number(time.slice(3)) || 0, 0, 0);
    const local = toLocalDateInput(next.toISOString());
    setDate(local.date);
    setTime(local.time);
    setError(null);
  }

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Give this event a title.");
      return;
    }
    const when = fromLocalDateInput(date, time);
    if (!when) {
      setError("Choose a date and time.");
      return;
    }
    if (when.getTime() <= Date.now()) {
      setError("Pick a moment still ahead of you.");
      return;
    }
    setError(null);
    onSave({
      title: trimmed,
      description: description.trim(),
      at: when.toISOString(),
    });
  }

  async function handleInvite() {
    if (!event) return;
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    setError(null);
    try {
      await inviteUser({ data: { eventId: event.id, email, role: inviteRole } });
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-1 px-3 pt-[var(--app-inset-top)] pb-2">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Back">
          <ArrowLeftIcon size={20} />
        </Button>
        <h1 className="flex flex-1 text-base font-medium">{event ? "Edit event" : "New event"}</h1>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pt-2 pb-4">
        <div className="app-rise flex flex-col gap-2">
          <Label htmlFor="event-title">Title</Label>
          <Input
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="Wedding, launch, reunion"
            autoComplete="off"
            autoFocus={!event}
          />
        </div>

        <div className="app-rise app-rise-2 flex flex-col gap-2">
          <Label htmlFor="event-description">Description</Label>
          <Textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={280}
            placeholder="A short note about the day"
          />
        </div>

        <div className="app-rise app-rise-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>When</Label>
            <span className="flex flex-wrap justify-end gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset.days)}
                  className="flex rounded-full border-border bg-surface px-2.5 py-1 text-[0.7rem] font-medium text-muted transition-colors duration-(--motion-quick) hover:border-border-strong hover:text-fg"
                >
                  {preset.label}
                </button>
              ))}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-date" className="flex items-center gap-1.5 text-xs">
                <CalendarDaysIcon size={14} />
                Date
              </Label>
              <Input
                id="event-date"
                type="date"
                value={date}
                min={minDate}
                onChange={(e) => {
                  setDate(e.target.value);
                  setError(null);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-time" className="flex items-center gap-1.5 text-xs">
                <TimerIcon size={14} />
                Time
              </Label>
              <Input
                id="event-time"
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  setError(null);
                }}
              />
            </div>
          </div>

          <div className="flex min-h-11 items-center rounded-md border-border bg-surface-2 px-4 py-2.5 text-xs text-muted">
            {preview ? (
              <span className="flex tabular-nums">
                Counting down{" "}
                <span className="flex font-medium text-fg">{preview.years} years</span>,{" "}
                <span className="flex font-medium text-fg">{preview.months} months</span>,{" "}
                <span className="flex font-medium text-fg">{preview.days} days</span> and{" "}
                <span className="flex font-medium text-fg">{preview.hours} hours</span>
              </span>
            ) : (
              <span>Choose a future date to see the countdown.</span>
            )}
          </div>
        </div>

        {event && (
          <div className="app-rise app-rise-3 mt-4 flex flex-col gap-4 border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <UsersIcon size={18} className="text-muted" />
              <h2 className="text-sm font-medium">Collaborators</h2>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter email to invite"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    type="email"
                  />
                </div>
                <Select
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as ParticipantRole)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handleInvite} disabled={inviting || !inviteEmail}>
                  <UserRoundPlusIcon size={18} />
                </Button>
              </div>

              {event.participants.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {event.participants.map((p) => (
                    <li key={p.userId} className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-fg">{p.email}</span>
                        <span className="text-[10px] text-muted capitalize">{p.role} · {p.inviteStatus}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {error ? (
          <p className="flex text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        {confirmDelete && onDelete ? (
          <div className="flex rounded-lg border-border bg-surface px-4 py-4">
            <p className="flex text-sm text-fg">Delete this event? The countdown cannot be undone.</p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" className="flex flex-1" onClick={() => setConfirmDelete(false)}>
                Keep
              </Button>
              <Button variant="danger" className="flex flex-1" onClick={onDelete}>
                Delete
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex gap-2 px-6 pt-2 pb-[var(--app-inset-bottom)]">
        {onDelete ? (
          <Button
            variant="outline"
            onClick={() => setConfirmDelete(true)}
            className="flex text-muted hover:text-danger"
          >
            Delete
          </Button>
        ) : null}
        <Button className="flex flex-1" onClick={handleSave}>
          <CheckIcon size={18} className="flex text-accent-fg" />
          {event ? "Save changes" : "Create event"}
        </Button>
      </div>
    </div>
  );
}
