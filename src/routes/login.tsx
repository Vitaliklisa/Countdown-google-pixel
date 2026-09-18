import { createFileRoute, useRouter } from "@tanstack/react-router";
import { signIn, authClient, GROK_PROVIDERS } from "@/lib/auth/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClockIcon } from "lucide-animated";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (providerId: string) => {
    setLoadingProvider(providerId);
    setError(null);
    try {
      await signIn(providerId, { callbackURL: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoadingProvider(null);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6">
      <div className="flex w-full max-w-sm flex-col gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-surface text-accent">
            <ClockIcon size={28} />
          </div>
          <h1 className="font-display text-4xl tracking-tight text-fg">Until</h1>
          <p className="text-muted">Sign in to save and share your countdowns.</p>
        </div>

        <div className="flex flex-col gap-3">
          {GROK_PROVIDERS.map((provider) => (
            <Button
              key={provider.providerId}
              variant="outline"
              className="h-12 w-full justify-start gap-3 px-4"
              onClick={() => handleSignIn(provider.providerId)}
              disabled={!!loadingProvider}
            >
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm bg-surface text-[10px] font-semibold text-accent">
                {provider.label.slice(0, 1)}
              </span>
              <span>
                {loadingProvider === provider.providerId ? "Connecting..." : `Continue with ${provider.label}`}
              </span>
            </Button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <p className="text-xs text-subtle">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
