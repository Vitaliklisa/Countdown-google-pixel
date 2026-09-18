import { auth } from "@/lib/auth/server";
import { createFileRoute } from "@tanstack/react-router";

export const APIRoute = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});

export const Route = APIRoute;
