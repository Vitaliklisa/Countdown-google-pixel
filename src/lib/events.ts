import { z } from "zod";

export const participantRoleSchema = z.enum(["admin", "editor", "viewer"]);

export const participantSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: participantRoleSchema,
  joinedAt: z.string(),
  inviteStatus: z.enum(["pending", "accepted", "rejected"]),
});

export const noteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  text: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const countdownEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(80),
  description: z.string().max(280),
  at: z.string().min(1),
  createdBy: z.string(),
  participants: z.array(participantSchema),
  notes: z.array(noteSchema).optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  deletedAt: z.string().optional(),
});

export type ParticipantRole = z.infer<typeof participantRoleSchema>;
export type Participant = z.infer<typeof participantSchema>;
export type Note = z.infer<typeof noteSchema>;
export type CountdownEvent = z.infer<typeof countdownEventSchema>;

const persistedSchema = z.object({
  events: z.array(countdownEventSchema),
  selectedId: z.string().nullable(),
});

export const EVENTS_STORAGE_KEY = "until.events.v1";

export function parsePersisted(raw: string | null): {
  events: CountdownEvent[];
  selectedId: string | null;
} {
  if (!raw) return { events: [], selectedId: null };
  try {
    const parsed = persistedSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { events: [], selectedId: null };
    const events = parsed.data.events.filter((event) => !Number.isNaN(new Date(event.at).getTime()));
    const selectedId =
      parsed.data.selectedId && events.some((event) => event.id === parsed.data.selectedId)
        ? parsed.data.selectedId
        : null;
    return { events, selectedId };
  } catch {
    return { events: [], selectedId: null };
  }
}

export function pickFeatured(
  events: CountdownEvent[],
  selectedId: string | null,
  now: Date,
): CountdownEvent | null {
  if (events.length === 0) return null;
  if (selectedId) {
    const selected = events.find((event) => event.id === selectedId);
    if (selected) return selected;
  }
  const upcoming = events
    .filter((event) => new Date(event.at).getTime() > now.getTime())
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  if (upcoming[0]) return upcoming[0];
  return [...events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0] ?? null;
}

export function toLocalDateInput(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: "", time: "18:00" };
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { date: `${y}-${m}-${day}`, time: `${hh}:${mm}` };
}

export function fromLocalDateInput(date: string, time: string): Date | null {
  if (!date) return null;
  const stamp = `${date}T${time || "00:00"}:00`;
  const d = new Date(stamp);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function defaultComposerValues(now = new Date()): { date: string; time: string } {
  const d = new Date(now.getTime());
  d.setDate(d.getDate() + 30);
  d.setHours(18, 0, 0, 0);
  return toLocalDateInput(d.toISOString());
}
