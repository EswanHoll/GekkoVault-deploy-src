import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SignInGate } from "@/components/shell";
import { getAudit } from "@/lib/secrets/fn";
import type { AuditRow } from "@/lib/secrets/types";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/audit")({ component: AuditPage });
function AuditPage() {
  return (
    <AppShell>
      <SignInGate>
        <AuditPanel />
      </SignInGate>
    </AppShell>
  );
}
function AuditPanel() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    getAudit()
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }, []);
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Audit
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Who fetched which name, when, and whether it was ok / missing /
          denied. Values are never written to this log.
        </p>
      </header>
      {err && (
        <p className="text-sm text-danger" role="alert">
          {err}
        </p>
      )}
      {!rows ? (
        <div className="h-48 animate-pulse rounded-xl bg-surface" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">No events yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-subtle">
              <tr>
                <th className="px-3 py-2.5 font-medium">When</th>
                <th className="px-3 py-2.5 font-medium">Actor</th>
                <th className="px-3 py-2.5 font-medium">Action</th>
                <th className="px-3 py-2.5 font-medium">Name</th>
                <th className="px-3 py-2.5 font-medium">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-bg">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface/50">
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-xs text-muted">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {r.tool_name ? `${r.actor} (${r.tool_name})` : r.actor}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">{r.action}</td>
                  <td className="max-w-56 truncate px-3 py-2.5 font-mono text-xs">
                    {r.secret_name ?? "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        r.result === "ok" && "bg-success/15 text-success",
                        r.result === "missing" && "bg-elevated text-muted",
                        r.result === "denied" && "bg-danger/15 text-danger",
                        r.result === "error" && "bg-danger/15 text-danger",
                      )}
                    >
                      {r.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
