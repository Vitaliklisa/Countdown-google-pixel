import { create } from "zustand";
import {
  EVENTS_STORAGE_KEY,
  parsePersisted,
  type CountdownEvent,
} from "@/lib/events";
import { listEvents, createEvent, updateEvent, deleteEvent } from "@/lib/events.api";

type Draft = {
  title: string;
  description: string;
  at: string;
};

type EventStore = {
  events: CountdownEvent[];
  selectedId: string | null;
  hydrated: boolean;
  loading: boolean;
  hydrate: (userId?: string) => Promise<void>;
  /** Re-fetch silently (no spinner) — used to pick up other devices' edits. */
  refresh: (userId?: string) => Promise<void>;
  addEvent: (draft: Draft, userId?: string) => Promise<string>;
  updateEvent: (id: string, draft: Draft, userId?: string) => Promise<void>;
  removeEvent: (id: string, userId?: string) => Promise<void>;
  selectEvent: (id: string) => void;
};

function persist(events: CountdownEvent[], selectedId: string | null) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify({ events, selectedId }));
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  selectedId: null,
  hydrated: false,
  loading: false,
  hydrate: async (userId) => {
    if (get().loading) return;
    set({ loading: true });

    if (!userId) {
      // Local mode
      if (typeof window === "undefined") {
        set({ hydrated: true, loading: false });
        return;
      }
      const { events, selectedId } = parsePersisted(window.localStorage.getItem(EVENTS_STORAGE_KEY));
      set({ events, selectedId, hydrated: true, loading: false });
      return;
    }

    // Server mode
    try {
      const serverEvents = await listEvents();
      // Server rows arrive untyped (raw SQL result); this maps them onto the
      // CountdownEvent shape, filling participants for events with none yet.
      const events = (serverEvents as unknown as CountdownEvent[]).map((e) => ({
        ...e,
        participants: e.participants ?? [],
      }));
      set({ events, hydrated: true, loading: false });
    } catch (err) {
      console.error("Failed to fetch server events:", err);
      set({ loading: false });
    }
  },
  // Same fetch as hydrate but WITHOUT toggling `loading`, so a background poll
  // never flashes the full-screen spinner over a list the user is reading.
  refresh: async (userId) => {
    if (!userId) return; // local mode has no remote source of truth to poll
    try {
      const serverEvents = await listEvents();
      const events = (serverEvents as unknown as CountdownEvent[]).map((e) => ({
        ...e,
        participants: e.participants ?? [],
      }));
      set({ events, hydrated: true });
    } catch (err) {
      // A transient poll failure (offline, deploy roll) must not disturb UI.
      console.warn("Failed to refresh server events:", err);
    }
  },
  addEvent: async (draft, userId) => {
    if (!userId) {
      const event: CountdownEvent = {
        id: newId(),
        title: draft.title.trim(),
        description: draft.description.trim(),
        at: draft.at,
        createdBy: "local",
        participants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const events = [event, ...get().events];
      persist(events, event.id);
      set({ events, selectedId: event.id });
      return event.id;
    }

    const { id } = await createEvent({ data: draft });
    await get().hydrate(userId);
    set({ selectedId: id });
    return id;
  },
  updateEvent: async (id, draft, userId) => {
    if (!userId) {
      const events = get().events.map((event) =>
        event.id === id
          ? {
              ...event,
              title: draft.title.trim(),
              description: draft.description.trim(),
              at: draft.at,
              updatedAt: new Date().toISOString(),
            }
          : event,
      );
      persist(events, get().selectedId);
      set({ events });
      return;
    }

    await updateEvent({ data: { id, ...draft } });
    await get().hydrate(userId);
  },
  removeEvent: async (id, userId) => {
    if (!userId) {
      const events = get().events.filter((event) => event.id !== id);
      const selectedId = get().selectedId === id ? (events[0]?.id ?? null) : get().selectedId;
      persist(events, selectedId);
      set({ events, selectedId });
      return;
    }

    await deleteEvent({ data: { id } });
    await get().hydrate(userId);
  },
  selectEvent: (id) => {
    persist(get().events, id);
    set({ selectedId: id });
  },
}));
