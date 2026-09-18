import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { r as signIn } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server-B5g-t8hu.mjs";
import { t as Button } from "./button--AwAlf_W.mjs";
import { i as ClockIcon } from "../_libs/lucide-animated+motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-B6Rtw_SA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const [error, setError] = (0, import_react.useState)(null);
	const [loadingProvider, setLoadingProvider] = (0, import_react.useState)(null);
	useRouter();
	const handleSignIn = async (providerId) => {
		setLoadingProvider(providerId);
		setError(null);
		try {
			await signIn(providerId, { callbackURL: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Sign in failed");
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
					children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "h-12 w-full justify-start gap-3 px-4",
						onClick: () => handleSignIn(provider.providerId),
						disabled: !!loadingProvider,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex size-5 shrink-0 items-center justify-center rounded-sm bg-surface text-[10px] font-semibold text-accent",
							children: provider.label.slice(0, 1)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loadingProvider === provider.providerId ? "Connecting..." : `Continue with ${provider.label}` })]
					}, provider.providerId))
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
