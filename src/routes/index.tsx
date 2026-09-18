import { createFileRoute } from "@tanstack/react-router";
import { UntilApp } from "@/components/until-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="min-h-dvh bg-canvas">
      <UntilApp />
    </main>
  );
}
