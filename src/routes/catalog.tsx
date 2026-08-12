import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SignInGate } from "@/components/shell";
import { createCatalogSecret, getCatalog } from "@/lib/secrets/fn";
import { SEED_SCOPES } from "@/lib/secrets/catalog-seed";
import type { CatalogRow } from "@/lib/secrets/types";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/catalog")({ component: CatalogPage });
function CatalogPage() {
  return (
    <AppShell>
      <SignInGate>
        <CatalogPanel />
      </SignInGate>
    </AppShell>
  );
}
function CatalogPanel() {
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [scope, setScope] = useState(SEED_SCOPES[0]?.id ?? "PROJ_BROKER");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  function reload() {
    getCatalog()
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }
  useEffect(() => {
    reload();
  }, []);
  const byScope = useMemo(() => {
    if (!rows) return [];
    const map = new Map<string, CatalogRow[]>();
    for (const r of rows) {
      const list = map.get(r.scope_id) ?? [];
      list.push(r);
      map.set(r.scope_id, list);
    }
    return [...map.entries()];
  }, [rows]);
  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const next = await createCatalogSecret({
        data: { name, scope_id: scope, description: desc },
      });
      setRows(next);
      setName("");
      setDesc("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Catalog
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Names only — the git-safe inventory. Values live in the vault (or AWS
          SM / Supabase Vault per scope). System of record is documented per
          project scope.
        </p>
      </header>
      <form
        onSubmit={onAdd}
        className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="block space-y-1.5 sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-medium text-muted">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="MY_KEY__PROJ_GEKKOTRADER"
            className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/40"
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted">Scope</span>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {SEED_SCOPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-medium text-muted">Description</span>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What this is for"
            className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="h-11 w-full rounded-md bg-accent text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Add name
          </button>
        </div>
      </form>
      {err && (
        <p className="text-sm text-danger" role="alert">
          {err}
        </p>
      )}
      {!rows ? (
        <div className="h-48 animate-pulse rounded-xl bg-surface" />
      ) : (
        <div className="space-y-6">
          {byScope.map(([scopeId, list]) => {
            const meta = SEED_SCOPES.find((s) => s.id === scopeId);
            return (
              <section key={scopeId} className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold">
                      {meta?.label ?? scopeId}
                    </h2>
                    <p className="text-xs text-subtle">
                      SoR: {list[0]?.system_of_record ?? "—"} · {scopeId}
                    </p>
                  </div>
                  <p className="text-xs tabular-nums text-muted">
                    {list.filter((r) => r.presence === "SET").length}/
                    {list.length} set
                  </p>
                </div>
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                  {list.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm text-fg">
                          {r.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {r.description || r.sensitivity}
                        </p>
                      </div>
                      <PresenceBadge presence={r.presence} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
function PresenceBadge({ presence }: { presence: "SET" | "MISSING" }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-xs font-medium tabular-nums",
        presence === "SET"
          ? "bg-success/15 text-success"
          : "bg-elevated text-subtle",
      )}
    >
      {presence}
    </span>
  );
}
