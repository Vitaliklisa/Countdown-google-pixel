import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as require_jsx_runtime, l as Slot } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button--AwAlf_W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[opacity,transform,background-color,color] duration-(--motion-quick) ease-[var(--ease-out)] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			ghost: "bg-transparent text-fg hover:bg-surface-2",
			outline: "border border-border bg-transparent text-fg hover:bg-surface",
			danger: "bg-danger text-danger-fg hover:opacity-90"
		},
		size: {
			default: "h-12 min-h-12 px-5",
			sm: "h-10 min-h-10 px-3 text-sm",
			icon: "size-11 min-h-11 min-w-11"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, type = "button", asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		type: asChild ? void 0 : type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { cn as n, Button as t };
