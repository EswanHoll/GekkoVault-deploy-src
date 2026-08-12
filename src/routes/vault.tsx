import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EyeOff } from "lucide-react";
import { AppShell, SignInGate } from "@/components/shell";
import { clearSecret, getCatalog, setSecret } from "@/lib/secrets/fn";
import type { CatalogRow } from "@/lib/secrets/types";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/vault")({ component: VaultPage });
function VaultPage() {
  return (
    <AppShell>
      <SignInGate>
        <VaultPanel />
      </SignInGate>
    </AppShell>
  );
}
function VaultPanel() {
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [selected, setSelected] = useState("");
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  function reload() {
    return getCatalog()
      .then((r) => {
        setRows(r);
        if (!selected && r[0]) setSelected(r[0].name);
      })
      .catch((e: Error) => setErr(e.message));
  }
  useEffect(() => {
    void reload();
  }, []);
  async function onPut(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await setSecret({ data: { name: selected, value } });
      setValue("");
      setMsg(`${selected} → SET (value not shown again)`);
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Write failed");
    } finally {
      setBusy(false);
    }
  }
  async function onClear() {
    if (!selected) return;
    setBusy(true);
    setErr(null);
    try {
      await clearSecret({ data: { name: selected } });
      setMsg(`${selected} → MISSING`);
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Clear failed");
    } finally {
      setBusy(false);
    }
  }
  const current = rows?.find((r) => r.name === selected);
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Vault
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Operator write path. Values are encrypted at rest (AES-256-GCM). After
          save, the UI only shows presence — never re-displays the value.
        </p>
      </header>
      <div className="flex items-start gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        <EyeOff className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden />
        <p>
          Hard rule: chat is emergency-only for secrets. If a value is pasted in
          chat, treat it as compromised and rotate.
        </p>
      </div>
      {!rows ? (
        <div className="h-48 animate-pulse rounded-xl bg-surface" />
      ) : (
        <form
          onSubmit={onPut}
          className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted">Secret name</span>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-elevated px-3 font-mono text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {rows.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.presence === "SET" ? "●" : "○"} {r.name}
                </option>
              ))}
            </select>
          </label>
          {current && (
            <p className="text-xs text-subtle">
              {current.description} · SoR {current.system_of_record} ·{" "}
              <span
                className={cn(
                  current.presence === "SET" ? "text-success" : "text-muted",
                )}
              >
                {current.presence}
              </span>
            </p>
          )}
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted">
              New value (write-only)
            </span>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              placeholder="Paste once — never logged"
              className="w-full resize-y rounded-md border border-border bg-elevated px-3 py-2.5 font-mono text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/40"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy || !value.trim()}
              className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Encrypt & store
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={busy || current?.presence !== "SET"}
              className="inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-medium text-muted transition-colors hover:text-fg disabled:opacity-40"
            >
              Clear value
            </button>
          </div>
          {msg && (
            <p className="text-sm text-success" role="status">
              {msg}
            </p>
          )}
          {err && (
            <p className="text-sm text-danger" role="alert">
              {err}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
