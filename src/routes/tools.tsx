import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Check } from "lucide-react";
import { AppShell, SignInGate } from "@/components/shell";
import { PLATFORM_DEFAULT_ALLOWLIST } from "@/lib/secrets/catalog-seed";
import { getCatalog, getTools, mintTool, revokeTool } from "@/lib/secrets/fn";
import type { ToolClientRow } from "@/lib/secrets/types";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/tools")({ component: ToolsPage });
const PLATFORMS = [
  "cursor",
  "grok",
  "manus",
  "apps",
  "ecs",
  "github_actions",
  "custom",
] as const;
function ToolsPage() {
  return (
    <AppShell>
      <SignInGate>
        <ToolsPanel />
      </SignInGate>
    </AppShell>
  );
}
function ToolsPanel() {
  const [tools, setTools] = useState<ToolClientRow[] | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [platform, setPlatform] = useState<string>("grok");
  const [toolName, setToolName] = useState("Grok smoke");
  const [purpose, setPurpose] = useState("confirm image + demo promote");
  const [ttl, setTtl] = useState(24);
  const [allowlist, setAllowlist] = useState<string[]>(
    PLATFORM_DEFAULT_ALLOWLIST.grok,
  );
  const [minted, setMinted] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  function reload() {
    Promise.all([getTools(), getCatalog()])
      .then(([t, c]) => {
        setTools(t);
        setNames(c.map((r) => r.name));
      })
      .catch((e: Error) => setErr(e.message));
  }
  useEffect(() => {
    reload();
  }, []);
  useEffect(() => {
    setAllowlist(PLATFORM_DEFAULT_ALLOWLIST[platform] ?? []);
  }, [platform]);
  function toggleName(n: string) {
    setAllowlist((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    );
  }
  async function onMint(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMinted(null);
    try {
      const res = await mintTool({
        data: {
          name: toolName,
          platform,
          allowlist,
          purpose,
          ttlHours: ttl,
        },
      });
      setMinted(res.token);
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Mint failed");
    } finally {
      setBusy(false);
    }
  }
  async function onRevoke(id: string) {
    setBusy(true);
    try {
      await revokeTool({ data: { id } });
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Revoke failed");
    } finally {
      setBusy(false);
    }
  }
  async function copyToken() {
    if (!minted) return;
    await navigator.clipboard.writeText(minted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Tool injectors
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Each platform gets a short-lived bearer token and an allowlist. That
          is the bootstrap secret for agents — not a copy of every product key.
        </p>
      </header>
      <form
        onSubmit={onMint}
        className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted">Platform</span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted">Label</span>
            <input
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-muted">Purpose</span>
            <input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted">TTL (hours)</span>
            <input
              type="number"
              min={1}
              max={720}
              value={ttl}
              onChange={(e) => setTtl(Number(e.target.value) || 24)}
              className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </label>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-muted">
            Allowlist (least privilege)
          </legend>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border bg-elevated p-2">
            {names.length === 0 ? (
              <p className="px-2 py-1 text-xs text-subtle">Loading names…</p>
            ) : (
              names.map((n) => {
                const on = allowlist.includes(n);
                return (
                  <label
                    key={n}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-sm",
                      on ? "bg-surface" : "hover:bg-surface/60",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleName(n)}
                      className="mt-1"
                    />
                    <span className="break-all font-mono text-xs sm:text-sm">
                      {n}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={busy || allowlist.length === 0}
          className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Mint tool token
        </button>
        {minted && (
          <div className="rounded-lg border border-border-strong bg-elevated p-3">
            <p className="text-xs font-medium text-muted">
              Shown once — store in the platform’s secrets UI, then close
            </p>
            <div className="mt-2 flex items-start gap-2">
              <code className="min-w-0 flex-1 break-all font-mono text-xs text-fg sm:text-sm">
                {minted}
              </code>
              <button
                type="button"
                onClick={copyToken}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border text-muted hover:text-fg"
                aria-label="Copy token"
              >
                {copied ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </div>
        )}
        {err && (
          <p className="text-sm text-danger" role="alert">
            {err}
          </p>
        )}
      </form>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Issued tokens</h2>
        {!tools ? (
          <div className="h-24 animate-pulse rounded-xl bg-surface" />
        ) : tools.length === 0 ? (
          <p className="text-sm text-muted">No tools yet.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {tools.map((t) => {
              const dead = Boolean(t.revoked_at);
              return (
                <li
                  key={t.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {t.name}{" "}
                      <span className="font-normal text-muted">
                        · {t.platform}
                      </span>
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-subtle">
                      {t.token_prefix}… · {t.allowlist.length} names ·{" "}
                      {dead
                        ? "revoked"
                        : t.expires_at
                          ? `expires ${new Date(t.expires_at).toLocaleString()}`
                          : "no expiry"}
                    </p>
                    {t.purpose && (
                      <p className="mt-1 text-xs text-muted">{t.purpose}</p>
                    )}
                  </div>
                  {!dead && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onRevoke(t.id)}
                      className="h-10 shrink-0 rounded-md border border-border px-3 text-sm text-muted transition-colors hover:text-danger"
                    >
                      Revoke
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
