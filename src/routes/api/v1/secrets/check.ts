import { createFileRoute } from "@tanstack/react-router";
import { agentPresenceCheck } from "@/lib/secrets/server";
/**
 * Agent API — presence only (SET / MISSING). Never returns values.
 * Auth: Authorization: Bearer sb_…
 */
export const Route = createFileRoute("/api/v1/secrets/check")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const auth = request.headers.get("authorization") ?? "";
          const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
          const body = (await request.json().catch(() => ({}))) as {
            names?: string[];
            purpose?: string;
          };
          const names = Array.isArray(body.names) ? body.names.slice(0, 50) : [];
          if (!names.length) {
            return Response.json(
              { error: "names[] required" },
              { status: 400 },
            );
          }
          const results = await agentPresenceCheck(
            bearer,
            names,
            body.purpose ?? "",
          );
          return Response.json({ results });
        } catch (e) {
          const status = (e as { status?: number }).status ?? 500;
          const message = e instanceof Error ? e.message : "error";
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
