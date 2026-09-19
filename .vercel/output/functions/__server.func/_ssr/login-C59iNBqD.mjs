import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as signInGoogle } from "./client-Aj463Vej.mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { t as Button } from "./button--AwAlf_W.mjs";
import { i as ClockIcon } from "../_libs/lucide-animated+motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-C59iNBqD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** The Google "G" mark, inline so it needs no asset fetch. */
function GoogleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: "18",
		height: "18",
		viewBox: "0 0 18 18",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4285F4",
				d: "M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#34A853",
				d: "M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FBBC05",
				d: "M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#EA4335",
				d: "M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
			})
		]
	});
}
function Login() {
	const [error, setError] = (0, import_react.useState)(null);
	const [loadingProvider, setLoadingProvider] = (0, import_react.useState)(null);
	const handleGoogleDirect = async () => {
		setLoadingProvider("google");
		setError(null);
		try {
			await signInGoogle({ callbackURL: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Google sign-in failed");
			setLoadingProvider(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center bg-canvas px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full max-w-sm flex-col gap-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-12 items-center justify-center rounded-xl bg-surface text-accent",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockIcon, { size: 28 })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl tracking-tight text-fg",
							children: "Until"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: "Sign in to save and share your countdowns."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "h-12 w-full justify-start gap-3 px-4",
						onClick: () => void handleGoogleDirect(),
						disabled: !!loadingProvider,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loadingProvider === "google" ? "Connecting…" : "Continue with Google" })]
					})
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-danger",
					role: "alert",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "By signing in, you agree to our Terms and Privacy Policy."
				})
			]
		})
	});
}
//#endregion
export { Login as component };
