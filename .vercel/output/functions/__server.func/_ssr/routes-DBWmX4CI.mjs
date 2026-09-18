import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as require_jsx_runtime, n as AvatarFallback$1, r as AvatarImage$1, t as Avatar$1 } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { Qt as string, Ut as array, Vt as _enum, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { a as signOut, t as authClient } from "./client-HjgKo5-L.mjs";
import { t as authMiddleware } from "./middleware-Dl9kJFpL.mjs";
import { n as cn, t as Button } from "./button--AwAlf_W.mjs";
import { a as HistoryIcon, c as PartyPopperIcon, d as TimerIcon, f as UserIcon, i as ClockIcon, l as PlusIcon, m as UsersIcon, n as CalendarDaysIcon, o as HourglassIcon, p as UserRoundPlusIcon, r as CheckIcon, s as LogoutIcon, t as ArrowLeftIcon, u as SparklesIcon } from "../_libs/lucide-animated+motion.mjs";
import { n as ChevronDown, r as Check } from "../_libs/lucide-react.mjs";
import { a as differenceInMinutes, c as addYears, d as addMonths, f as addDays, i as differenceInMonths, l as addMinutes, n as differenceInYears, o as differenceInHours, r as differenceInSeconds, s as differenceInDays, t as format, u as addHours } from "../_libs/date-fns.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as Separator2, i as Root2, n as Item2, o as Trigger, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { a as SelectItemIndicator, c as SelectTrigger$1, i as SelectItem$1, l as SelectValue$1, n as SelectContent$1, o as SelectItemText, r as SelectIcon, s as SelectPortal, t as Select$1, u as SelectViewport } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DBWmX4CI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var participantRoleSchema = _enum([
	"admin",
	"editor",
	"viewer"
]);
var participantSchema = object({
	userId: string(),
	email: string().email(),
	role: participantRoleSchema,
	joinedAt: string(),
	inviteStatus: _enum([
		"pending",
		"accepted",
		"rejected"
	])
});
var noteSchema = object({
	id: string(),
	userId: string(),
	text: string(),
	createdAt: string(),
	updatedAt: string()
});
var countdownEventSchema = object({
	id: string().min(1),
	title: string().min(1).max(80),
	description: string().max(280),
	at: string().min(1),
	createdBy: string(),
	participants: array(participantSchema),
	notes: array(noteSchema).optional(),
	createdAt: string().min(1),
	updatedAt: string().min(1),
	deletedAt: string().optional()
});
var persistedSchema = object({
	events: array(countdownEventSchema),
	selectedId: string().nullable()
});
var EVENTS_STORAGE_KEY = "until.events.v1";
function parsePersisted(raw) {
	if (!raw) return {
		events: [],
		selectedId: null
	};
	try {
		const parsed = persistedSchema.safeParse(JSON.parse(raw));
		if (!parsed.success) return {
			events: [],
			selectedId: null
		};
		const events = parsed.data.events.filter((event) => !Number.isNaN(new Date(event.at).getTime()));
		return {
			events,
			selectedId: parsed.data.selectedId && events.some((event) => event.id === parsed.data.selectedId) ? parsed.data.selectedId : null
		};
	} catch {
		return {
			events: [],
			selectedId: null
		};
	}
}
function pickFeatured(events, selectedId, now) {
	if (events.length === 0) return null;
	if (selectedId) {
		const selected = events.find((event) => event.id === selectedId);
		if (selected) return selected;
	}
	const upcoming = events.filter((event) => new Date(event.at).getTime() > now.getTime()).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
	if (upcoming[0]) return upcoming[0];
	return [...events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0] ?? null;
}
function toLocalDateInput(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return {
		date: "",
		time: "18:00"
	};
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	const hh = String(d.getHours()).padStart(2, "0");
	const mm = String(d.getMinutes()).padStart(2, "0");
	return {
		date: `${y}-${m}-${day}`,
		time: `${hh}:${mm}`
	};
}
function fromLocalDateInput(date, time) {
	if (!date) return null;
	const stamp = `${date}T${time || "00:00"}:00`;
	const d = new Date(stamp);
	return Number.isNaN(d.getTime()) ? null : d;
}
function defaultComposerValues(now = /* @__PURE__ */ new Date()) {
	const d = new Date(now.getTime());
	d.setDate(d.getDate() + 30);
	d.setHours(18, 0, 0, 0);
	return toLocalDateInput(d.toISOString());
}
function useNow(intervalMs = 1e3) {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);
	return now;
}
var createEventSchema = object({
	title: string().min(1).max(80),
	description: string().max(280),
	at: string().min(1)
});
var listEvents = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8afbac895d59a41477d32649fe71a1da0c8c6fd440647bc3bc09500df9664b82"));
var createEvent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(createEventSchema).handler(createSsrRpc("f21ae7d2695373c2f548b37306591c539f7a5e8e94f571522c2712a09232e856"));
var updateEvent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: string(),
	title: string().min(1).max(80),
	description: string().max(280),
	at: string().min(1)
})).handler(createSsrRpc("bf58e941e166b21a858534c9bd7fe29ef1d4e42b9ca8ecf75787328d176b896e"));
var deleteEvent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string() })).handler(createSsrRpc("fda746ddc54219a8ce2260a10efc5382af55b6851385e578118f3ba0a8859242"));
var inviteUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	eventId: string(),
	email: string().email(),
	role: _enum([
		"admin",
		"editor",
		"viewer"
	])
})).handler(createSsrRpc("fc56863d614659ca6b116680c799d86dfe625934fcc576736a056b53b3ed90d6"));
var getInvitations = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("9053c9586e5893fe0c4641ff5b841ec184a4b8d14022c905331a3df79c9d0ad5"));
/**
* Accept a pending invitation addressed to the signed-in user's email.
*
* This is what turns "shared across devices" on: an invited account was written
* to `invitations` (by email, possibly before that account existed); accepting
* inserts a real `event_participants` row so `listEvents` starts returning the
* event on every device that account signs in from.
*
* Security: the invitation is matched by the CALLER's verified email and its own
* id — never by anything client-supplied — so a user can only accept an invite
* addressed to them. Rejected/expired invites are refused.
*/
var acceptInvitation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ invitationId: string().min(1) })).handler(createSsrRpc("9779599942a6bef44eb071567bdb5e1f0030481baa5c9369d4dab8d7f7911996"));
/** Decline a pending invitation addressed to the signed-in user. */
var rejectInvitation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ invitationId: string().min(1) })).handler(createSsrRpc("571f8bdb3ed6c441b77e1a98027422fa39ff4a9df4196e3b3e396d5b3d85cd17"));
function persist(events, selectedId) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify({
		events,
		selectedId
	}));
}
function newId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
var useEventStore = create((set, get) => ({
	events: [],
	selectedId: null,
	hydrated: false,
	loading: false,
	hydrate: async (userId) => {
		if (get().loading) return;
		set({ loading: true });
		if (!userId) {
			if (typeof window === "undefined") {
				set({
					hydrated: true,
					loading: false
				});
				return;
			}
			const { events, selectedId } = parsePersisted(window.localStorage.getItem(EVENTS_STORAGE_KEY));
			set({
				events,
				selectedId,
				hydrated: true,
				loading: false
			});
			return;
		}
		try {
			set({
				events: (await listEvents()).map((e) => ({
					...e,
					participants: e.participants ?? []
				})),
				hydrated: true,
				loading: false
			});
		} catch (err) {
			console.error("Failed to fetch server events:", err);
			set({ loading: false });
		}
	},
	refresh: async (userId) => {
		if (!userId) return;
		try {
			set({
				events: (await listEvents()).map((e) => ({
					...e,
					participants: e.participants ?? []
				})),
				hydrated: true
			});
		} catch (err) {
			console.warn("Failed to refresh server events:", err);
		}
	},
	addEvent: async (draft, userId) => {
		if (!userId) {
			const event = {
				id: newId(),
				title: draft.title.trim(),
				description: draft.description.trim(),
				at: draft.at,
				createdBy: "local",
				participants: [],
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			const events = [event, ...get().events];
			persist(events, event.id);
			set({
				events,
				selectedId: event.id
			});
			return event.id;
		}
		const { id } = await createEvent({ data: draft });
		await get().hydrate(userId);
		set({ selectedId: id });
		return id;
	},
	updateEvent: async (id, draft, userId) => {
		if (!userId) {
			const events = get().events.map((event) => event.id === id ? {
				...event,
				title: draft.title.trim(),
				description: draft.description.trim(),
				at: draft.at,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			} : event);
			persist(events, get().selectedId);
			set({ events });
			return;
		}
		await updateEvent({ data: {
			id,
			...draft
		} });
		await get().hydrate(userId);
	},
	removeEvent: async (id, userId) => {
		if (!userId) {
			const events = get().events.filter((event) => event.id !== id);
			const selectedId = get().selectedId === id ? events[0]?.id ?? null : get().selectedId;
			persist(events, selectedId);
			set({
				events,
				selectedId
			});
			return;
		}
		await deleteEvent({ data: { id } });
		await get().hydrate(userId);
	},
	selectEvent: (id) => {
		persist(get().events, id);
		set({ selectedId: id });
	}
}));
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
function remainingUntil(target, now = /* @__PURE__ */ new Date()) {
	const totalMs = target.getTime() - now.getTime();
	if (Number.isNaN(totalMs) || totalMs <= 0) return {
		years: 0,
		months: 0,
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		totalMs: Number.isNaN(totalMs) ? 0 : totalMs,
		isPast: true
	};
	const years = differenceInYears(target, now);
	const afterYears = addYears(now, years);
	const months = differenceInMonths(target, afterYears);
	const afterMonths = addMonths(afterYears, months);
	const days = differenceInDays(target, afterMonths);
	const afterDays = addDays(afterMonths, days);
	const hours = differenceInHours(target, afterDays);
	const afterHours = addHours(afterDays, hours);
	const minutes = differenceInMinutes(target, afterHours);
	const afterMinutes = addMinutes(afterHours, minutes);
	return {
		years,
		months,
		days,
		hours,
		minutes,
		seconds: differenceInSeconds(target, afterMinutes),
		totalMs,
		isPast: false
	};
}
function pad2(n) {
	return String(Math.max(0, n)).padStart(2, "0");
}
var UNITS = [
	{
		key: "years",
		label: "Years"
	},
	{
		key: "months",
		label: "Months"
	},
	{
		key: "days",
		label: "Days"
	},
	{
		key: "hours",
		label: "Hours"
	}
];
function UnitTile({ value, label, live }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative flex flex-col items-center justify-center overflow-hidden rounded-md border-border bg-surface px-3 py-4 transition-colors duration-(--motion-fast)", live && "tile-live border-accent/40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				className: cn("absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent", live ? "via-accent/70" : "via-border-strong")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("font-display text-stat tabular-nums", value === 0 ? "text-subtle" : "text-fg"),
				children: pad2(value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("mt-1.5 text-xs font-medium tracking-label uppercase", live ? "text-accent" : "text-subtle"),
				children: label
			})
		]
	});
}
function CountdownFace({ target, now, className }) {
	const remaining = remainingUntil(target, now);
	if (remaining.isPast) return null;
	const liveUnit = remaining.hours > 0 ? "hours" : remaining.days > 0 ? "days" : "months";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col gap-4", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3",
			children: UNITS.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitTile, {
				value: remaining[unit.key],
				label: unit.label,
				live: unit.key === liveUnit
			}, unit.key))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center justify-center gap-2 text-sm tabular-nums text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"aria-hidden": "true",
					className: "relative flex size-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex size-1.5 rounded-full bg-accent" })]
				}),
				pad2(remaining.minutes),
				" min · ",
				pad2(remaining.seconds),
				" sec remaining"
			]
		})]
	});
}
var Input = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	className: cn("h-12 w-full min-w-0 rounded-md border border-border bg-surface px-4 text-base text-fg shadow-none outline-none transition-[border-color,box-shadow] duration-(--motion-quick) placeholder:text-subtle focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/30", className),
	...props
}));
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
	ref,
	className: cn("text-sm font-medium text-muted", className),
	...props
}));
Label.displayName = "Label";
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	ref,
	className: cn("min-h-28 w-full resize-none rounded-md border border-border bg-surface px-4 py-3 text-base text-fg outline-none transition-[border-color,box-shadow] duration-(--motion-quick) placeholder:text-subtle focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/30", className),
	...props
}));
Textarea.displayName = "Textarea";
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm ring-offset-bg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface text-fg shadow-soft data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
		className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
		children
	})
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-surface-2 focus:text-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
/** Quick jumps for the dates people actually pick — days to years ahead. */
var PRESETS = [
	{
		label: "+1 week",
		days: 7
	},
	{
		label: "+1 month",
		days: 30
	},
	{
		label: "+1 year",
		days: 365
	},
	{
		label: "+5 years",
		days: 1826
	}
];
function EventComposer({ event, now, onClose, onSave, onDelete }) {
	const initial = (0, import_react.useMemo)(() => {
		if (event) {
			const local = toLocalDateInput(event.at);
			return {
				title: event.title,
				description: event.description,
				date: local.date,
				time: local.time
			};
		}
		const defaults = defaultComposerValues(now);
		return {
			title: "",
			description: "",
			date: defaults.date,
			time: defaults.time
		};
	}, [event, now]);
	const [title, setTitle] = (0, import_react.useState)(initial.title);
	const [description, setDescription] = (0, import_react.useState)(initial.description);
	const [date, setDate] = (0, import_react.useState)(initial.date);
	const [time, setTime] = (0, import_react.useState)(initial.time);
	const [error, setError] = (0, import_react.useState)(null);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const [inviteEmail, setInviteEmail] = (0, import_react.useState)("");
	const [inviteRole, setInviteRole] = (0, import_react.useState)("viewer");
	const [inviting, setInviting] = (0, import_react.useState)(false);
	useCurrentUser();
	const minDate = (0, import_react.useMemo)(() => {
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	}, [now]);
	const preview = (0, import_react.useMemo)(() => {
		const when = fromLocalDateInput(date, time);
		if (!when || when.getTime() <= now.getTime()) return null;
		return remainingUntil(when, now);
	}, [
		date,
		time,
		now
	]);
	function applyPreset(days) {
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
			at: when.toISOString()
		});
	}
	async function handleInvite() {
		if (!event) return;
		const email = inviteEmail.trim();
		if (!email) return;
		setInviting(true);
		setError(null);
		try {
			await inviteUser({ data: {
				eventId: event.id,
				email,
				role: inviteRole
			} });
			setInviteEmail("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Invite failed");
		} finally {
			setInviting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-1 px-3 pt-[var(--app-inset-top)] pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: onClose,
					"aria-label": "Back",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftIcon, { size: 20 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "flex flex-1 text-base font-medium",
					children: event ? "Edit event" : "New event"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-5 overflow-y-auto px-6 pt-2 pb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "app-rise flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "event-title",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "event-title",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							maxLength: 80,
							placeholder: "Wedding, launch, reunion",
							autoComplete: "off",
							autoFocus: !event
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "app-rise app-rise-2 flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "event-description",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "event-description",
							value: description,
							onChange: (e) => setDescription(e.target.value),
							maxLength: 280,
							placeholder: "A short note about the day"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "app-rise app-rise-3 flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "When" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex flex-wrap justify-end gap-1.5",
									children: PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => applyPreset(preset.days),
										className: "flex rounded-full border-border bg-surface px-2.5 py-1 text-[0.7rem] font-medium text-muted transition-colors duration-(--motion-quick) hover:border-border-strong hover:text-fg",
										children: preset.label
									}, preset.label))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: "event-date",
										className: "flex items-center gap-1.5 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDaysIcon, { size: 14 }), "Date"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "event-date",
										type: "date",
										value: date,
										min: minDate,
										onChange: (e) => {
											setDate(e.target.value);
											setError(null);
										}
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: "event-time",
										className: "flex items-center gap-1.5 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimerIcon, { size: 14 }), "Time"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "event-time",
										type: "time",
										value: time,
										onChange: (e) => {
											setTime(e.target.value);
											setError(null);
										}
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex min-h-11 items-center rounded-md border-border bg-surface-2 px-4 py-2.5 text-xs text-muted",
								children: preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex tabular-nums",
									children: [
										"Counting down",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex font-medium text-fg",
											children: [preview.years, " years"]
										}),
										",",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex font-medium text-fg",
											children: [preview.months, " months"]
										}),
										",",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex font-medium text-fg",
											children: [preview.days, " days"]
										}),
										" and",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex font-medium text-fg",
											children: [preview.hours, " hours"]
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Choose a future date to see the countdown." })
							})
						]
					}),
					event && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "app-rise app-rise-3 mt-4 flex flex-col gap-4 border-t border-border pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersIcon, {
								size: 18,
								className: "text-muted"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium",
								children: "Collaborators"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Enter email to invite",
											value: inviteEmail,
											onChange: (e) => setInviteEmail(e.target.value),
											type: "email"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: inviteRole,
										onValueChange: (v) => setInviteRole(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "w-24",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "viewer",
												children: "Viewer"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "editor",
												children: "Editor"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "admin",
												children: "Admin"
											})
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "icon",
										onClick: handleInvite,
										disabled: inviting || !inviteEmail,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRoundPlusIcon, { size: 18 })
									})
								]
							}), event.participants.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "flex flex-col gap-2",
								children: event.participants.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "flex items-center justify-between rounded-md bg-surface px-3 py-2 text-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-fg",
											children: p.email
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] text-muted capitalize",
											children: [
												p.role,
												" · ",
												p.inviteStatus
											]
										})]
									})
								}, p.userId))
							})]
						})]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "flex text-sm text-danger",
						role: "alert",
						children: error
					}) : null,
					confirmDelete && onDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex rounded-lg border-border bg-surface px-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "flex text-sm text-fg",
							children: "Delete this event? The countdown cannot be undone."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "flex flex-1",
								onClick: () => setConfirmDelete(false),
								children: "Keep"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								className: "flex flex-1",
								onClick: onDelete,
								children: "Delete"
							})]
						})]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 px-6 pt-2 pb-[var(--app-inset-bottom)]",
				children: [onDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setConfirmDelete(true),
					className: "flex text-muted hover:text-danger",
					children: "Delete"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "flex flex-1",
					onClick: handleSave,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {
						size: 18,
						className: "flex text-accent-fg"
					}), event ? "Save changes" : "Create event"]
				})]
			})
		]
	});
}
/**
* Palette for the celebration — pulled from the accent plus two fixed party
* hues, so it reads as confetti and not as a second product accent.
*/
var PARTY_COLORS = [
	"var(--color-accent)",
	"#e8b64c",
	"#e0709a",
	"#7cc4e8",
	"#f0f1ee"
];
function usePieces(count) {
	const [seed, setSeed] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setSeed(1);
	}, []);
	return (0, import_react.useMemo)(() => {
		let s = 1337 + seed * 7919;
		const rand = () => {
			s = (s * 1103515245 + 12345) % 2147483648;
			return s / 2147483648;
		};
		return Array.from({ length: count }, (_, id) => {
			const shape = id % 5 === 0 ? "chip" : id % 3 === 0 ? "dot" : "bar";
			return {
				id,
				left: rand() * 100,
				drift: (rand() - .5) * 220,
				spin: 180 + rand() * 900 * (rand() > .5 ? 1 : -1),
				duration: 2.8 + rand() * 2.6,
				delay: rand() * 1.6,
				width: shape === "bar" ? 6 + rand() * 6 : 9 + rand() * 6,
				height: shape === "bar" ? 14 + rand() * 12 : 9 + rand() * 6,
				radius: shape === "dot" ? "9999px" : shape === "chip" ? "2px" : "9999px",
				shape,
				color: PARTY_COLORS[id % PARTY_COLORS.length]
			};
		});
	}, [count, seed]);
}
/**
* The moment the countdown hits zero. Renders a celebratory burst: a repeating
* confetti field, an expanding ring, an animated check icon, and the event's
* own title/description as the punchline.
*/
function ArrivalCelebration({ title, description, className }) {
	const pieces = usePieces(80);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative isolate overflow-hidden rounded-lg", className),
		role: "status",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			className: "pointer-events-none fixed inset-0 z-40 overflow-hidden",
			children: pieces.map((piece) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "confetti-piece absolute top-0 block",
				style: {
					left: `${piece.left}%`,
					width: `${piece.width}px`,
					height: `${piece.height}px`,
					borderRadius: piece.radius,
					background: piece.color,
					["--drift"]: `${piece.drift}px`,
					["--spin"]: `${piece.spin}deg`,
					["--duration"]: `${piece.duration}s`,
					["--delay"]: `${piece.delay}s`
				}
			}, piece.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex-col items-center gap-3 px-6 py-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "relative inline-flex size-16 items-center justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						className: "ring-pop absolute inset-0 rounded-full border-2 border-accent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {
							size: 30,
							className: "text-accent"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium tracking-label text-accent uppercase",
					children: "The day has come"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "max-w-xs text-sm text-muted",
					children: [
						title,
						" is here",
						description ? ` — ${description}` : " — enjoy every minute of it."
					]
				})
			]
		})]
	});
}
/**
* Pending shared-event invitations for the signed-in user, with accept/decline.
*
* This is the receiving half of sharing: `inviteUser` writes an invitation by
* email (possibly before that account even existed). Once the invitee signs in
* here — on any device — accepting creates the `event_participants` row, which is
* what makes `listEvents` start returning the shared event everywhere they log
* in. Without this, an invited person could never actually join.
*
* Renders nothing when signed out or when there is nothing pending, so it costs
* a browser session no layout.
*/
function InvitationsBanner({ onAccepted }) {
	const { user, isPending } = useCurrentUserState();
	const [invites, setInvites] = (0, import_react.useState)([]);
	const [busyId, setBusyId] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			const rows = await getInvitations();
			setInvites(Array.isArray(rows) ? rows : []);
		} catch {
			setInvites([]);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (isPending || !user?.id) {
			setInvites([]);
			return;
		}
		load();
	}, [
		load,
		user?.id,
		isPending
	]);
	if (!user?.id || invites.length === 0) return null;
	async function respond(invite, accept) {
		setBusyId(invite.id);
		try {
			if (accept) {
				await acceptInvitation({ data: { invitationId: invite.id } });
				onAccepted?.();
			} else await rejectInvitation({ data: { invitationId: invite.id } });
			setInvites((prev) => prev.filter((i) => i.id !== invite.id));
		} catch {} finally {
			setBusyId(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2 rounded-md border-border bg-surface p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium tracking-brand text-muted uppercase",
			children: "Shared with you"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-2",
			children: invites.map((invite) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-sm font-medium text-fg",
						children: invite.eventTitle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-[10px] text-muted capitalize",
						children: ["invited as ", invite.role]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex shrink-0 items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						disabled: busyId === invite.id,
						onClick: () => void respond(invite, false),
						children: "Decline"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						disabled: busyId === invite.id,
						onClick: () => void respond(invite, true),
						children: "Join"
					})]
				})]
			}, invite.id))
		})]
	});
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-1 text-fg shadow-soft data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-surface-2 focus:text-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-border", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var Avatar = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar$1, {
	ref,
	className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
	...props
}));
Avatar.displayName = Avatar$1.displayName;
var AvatarImage = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage$1, {
	ref,
	className: cn("aspect-square h-full w-full", className),
	...props
}));
AvatarImage.displayName = AvatarImage$1.displayName;
var AvatarFallback = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback$1, {
	ref,
	className: cn("flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-subtle", className),
	...props
}));
AvatarFallback.displayName = AvatarFallback$1.displayName;
function BrandMark() {
	const clock = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const handle = clock.current;
		if (!handle) return;
		handle.startAnimation();
		const id = window.setTimeout(() => handle.stopAnimation(), 1200);
		return () => window.clearTimeout(id);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockIcon, {
			ref: clock,
			size: 19,
			animateOnHover: true,
			className: "text-accent"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium tracking-brand text-fg uppercase",
			children: "Until"
		})]
	});
}
function EventRow({ event, active, now, onSelect }) {
	const past = new Date(event.at).getTime() <= now.getTime();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelect,
		className: cn("flex min-h-14 w-full items-center justify-between gap-3 rounded-md px-4 py-3 text-left transition-colors duration-(--motion-quick)", active ? "bg-surface-2" : "bg-surface hover:bg-surface-2"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-sm font-medium text-fg",
				children: event.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-xs text-muted",
				children: format(new Date(event.at), "MMM d, yyyy · h:mm a")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: cn("flex shrink-0 items-center gap-1.5 text-xs", past ? "text-accent" : "text-subtle"),
			children: [past ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryIcon, { size: 13 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDaysIcon, { size: 13 }), past ? "Passed" : "Upcoming"]
		})]
	});
}
function EmptyState({ onCompose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col justify-center gap-5 px-6 pb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "app-rise inline-flex size-14 items-center justify-center rounded-lg bg-surface text-accent",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HourglassIcon, {
						size: 26,
						className: "text-accent"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "app-rise app-rise-2 font-display text-4xl leading-tight tracking-tight text-fg",
					children: "Name a day."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "app-rise app-rise-3 max-w-xs text-base text-muted",
					children: "Pick a future moment — a wedding, a launch, a trip home. Until counts the years, months, days and hours left, then celebrates when it arrives."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-6 pb-[var(--app-inset-bottom)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "w-full",
				onClick: onCompose,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {
					size: 18,
					className: "text-accent-fg"
				}), "Create event"]
			})
		})]
	});
}
function UserButton() {
	const { user } = useCurrentUserState();
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "sm",
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/login",
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserIcon, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sign in" })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "rounded-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
				className: "size-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: user.profileImageUrl ?? void 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-surface-2 text-[10px] font-medium text-muted",
					children: user.displayName?.slice(0, 2).toUpperCase() || "U"
				})]
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-48",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col px-2 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-xs font-medium text-fg",
					children: user.displayName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-[10px] text-muted",
					children: user.primaryEmail
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: () => signOut("/"),
				className: "text-danger",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoutIcon, {
					size: 14,
					className: "mr-2"
				}), "Sign out"]
			})
		]
	})] });
}
function HomeView({ featured, events, now, onCompose, onEdit, onSelect, onInviteAccepted }) {
	const others = featured ? events.filter((event) => event.id !== featured.id) : events;
	if (!featured) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between px-6 pt-[var(--app-inset-top)] pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-6 pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvitationsBanner, { onAccepted: onInviteAccepted })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { onCompose })
		]
	});
	const target = new Date(featured.at);
	const arrived = target.getTime() <= now.getTime();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": "true",
				className: "glow-drift pointer-events-none absolute -top-24 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 flex items-center justify-between px-6 pt-[var(--app-inset-top)] pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: onEdit,
						"aria-label": "Edit event",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparklesIcon, { size: 18 })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col overflow-y-auto px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvitationsBanner, { onAccepted: onInviteAccepted })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2 text-xs font-medium tracking-label text-subtle uppercase",
						children: arrived ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyPopperIcon, {
							size: 14,
							className: "text-accent"
						}), "Arrived"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HourglassIcon, { size: 14 }), "Counting down"] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "app-rise mt-2 font-display text-3xl leading-tight tracking-tight text-fg",
						children: featured.title
					}),
					featured.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "app-rise app-rise-2 mt-2 text-sm text-muted",
						children: featured.description
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-subtle",
						children: format(target, "EE, MMMM d, yyyy · h:mm a")
					}),
					arrived ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrivalCelebration, {
						title: featured.title,
						description: featured.description,
						className: "mt-6 bg-surface"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownFace, {
						target,
						now,
						className: "mt-7"
					}),
					others.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-xs font-medium tracking-label text-subtle uppercase",
							children: "Other events"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "flex flex-col gap-2",
							children: others.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventRow, {
								event,
								active: false,
								now,
								onSelect: () => onSelect(event.id)
							}) }, event.id))
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky bottom-0 mt-4 bg-bg/95 px-6 pt-3 pb-[var(--app-inset-bottom)] backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full",
					onClick: onCompose,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {
						size: 18,
						className: "text-accent-fg"
					}), "New event"]
				})
			})
		]
	});
}
function UntilApp() {
	const now = useNow(1e3);
	const { user, isPending } = useCurrentUserState();
	const { events, selectedId, hydrated, loading, hydrate, refresh, addEvent, updateEvent, removeEvent, selectEvent } = useEventStore();
	const [view, setView] = (0, import_react.useState)("home");
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!isPending) hydrate(user?.id);
	}, [
		hydrate,
		user?.id,
		isPending
	]);
	(0, import_react.useEffect)(() => {
		if (isPending || !user?.id) return;
		const id = window.setInterval(() => void refresh(user.id), 2e4);
		const onFocus = () => void refresh(user.id);
		window.addEventListener("focus", onFocus);
		return () => {
			window.clearInterval(id);
			window.removeEventListener("focus", onFocus);
		};
	}, [
		refresh,
		user?.id,
		isPending
	]);
	(0, import_react.useEffect)(() => {
		if (isPending || !user?.id) return;
		let cancelled = false;
		(async () => {
			const { registerPush } = await import("./push-DfzC2iNS.mjs");
			if (cancelled) return;
			try {
				await registerPush();
			} catch (err) {
				console.warn("[push] registration failed:", err);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [user?.id, isPending]);
	const featured = (0, import_react.useMemo)(() => pickFeatured(events, selectedId, now), [
		events,
		selectedId,
		now
	]);
	const editing = editingId ? events.find((event) => event.id === editingId) ?? null : null;
	if (!hydrated || isPending || loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-0 flex-1 flex-col items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockIcon, {
			size: 32,
			className: "animate-spin text-accent/50"
		})
	});
	if (view === "compose") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventComposer, {
		event: editing,
		now,
		onClose: () => {
			setView("home");
			setEditingId(null);
		},
		onSave: async (draft) => {
			if (editing) await updateEvent(editing.id, draft, user?.id);
			else await addEvent(draft, user?.id);
			setView("home");
			setEditingId(null);
		},
		onDelete: editing ? async () => {
			await removeEvent(editing.id, user?.id);
			setView("home");
			setEditingId(null);
		} : void 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeView, {
		featured,
		events,
		now,
		onInviteAccepted: () => {
			if (user?.id) refresh(user.id);
		},
		onCompose: () => {
			setEditingId(null);
			setView("compose");
		},
		onEdit: () => {
			if (!featured) return;
			setEditingId(featured.id);
			setView("compose");
		},
		onSelect: (id) => selectEvent(id)
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-canvas",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UntilApp, {})
	});
}
//#endregion
export { createSsrRpc as n, routes_exports as t };
