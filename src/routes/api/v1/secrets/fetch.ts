import { createFileRoute } from "@tanstack/react-router";
import { agentFetch } from "@/lib/secrets/server";
/**
 * Agent API — fetch values once into process env of the caller.
 * Auth: Authorization: Bearer sb_…
 * Audit logs name + result only — never the value.
 */
export const Route = createFileRoute("/api/v1/secrets/fetch")({
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
          const names = Array.isArray(body.names) ? body.names.slice(0, 30) : [];
          if (!names.length) {
            return Response.json(
              { error: "names[] required" },
              { status: 400 },
            );
          }
          const secrets = await agentFetch(bearer, names, body.purpose ?? "");
          return Response.json({
            secrets,
            notice:
              "Inject into process env only. Do not log values. Rotate if pasted in chat.",
          });
        } catch (e) {
          const status = (e as { status?: number }).status ?? 500;
          const message = e instanceof Error ? e.message : "error";
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
