import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  KeyRound,
  Shield,
  Wrench,
} from "lucide-react";
import { AppShell, SignInGate } from "@/components/shell";
import { getDashboard } from "@/lib/secrets/fn";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/")({ component: OverviewPage });
function OverviewPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle">
            Cross-platform secrets standard
          </p>
          <h1 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            One system of record. Thin injectors per tool.
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Cursor Secrets are a delivery channel into Cursor VMs — not a shared
            vault. GekkoVault is the shared store: catalog names in git, encrypted
            values here (or AWS SM / Supabase Vault), short-lived tool tokens for
            Grok, Manus, apps, and ECS.
          </p>
        </section>
        <div className="grid gap-3 sm:grid-cols-3">
          <RuleCard
            title="Git = names only"
            body="Catalog uses __PROJ_* suffixes. Values never land in repo or chat as the normal path."
          />
          <RuleCard
            title="Least privilege"
            body="Grok for smoke/promote does not get Binance live or full admin. Each tool has an allowlist."
          />
          <RuleCard
            title="Audit without values"
            body="Logs show who fetched which name and SET/MISSING — never the secret itself."
          />
        </div>
        <SignInGate>
          <DashboardStats />
        </SignInGate>
        <section className="grid gap-3 sm:grid-cols-2">
          <FlowStep
            n="1"
            title="Catalog"
            body="Register secret names and scopes (GekkoTrader → AWS SM, portfolio → Vault)."
            to="/catalog"
          />
          <FlowStep
            n="2"
            title="Vault"
            body="Operator writes values once. Encrypted at rest. Presence shows SET/MISSING only."
            to="/vault"
          />
          <FlowStep
            n="3"
            title="Tool tokens"
            body="Mint sb_… tokens for cursor / grok / manus / apps with allowlists + TTL."
            to="/tools"
          />
          <FlowStep
            n="4"
            title="Agent inject"
            body="Session start: POST /api/v1/secrets/fetch — inject env, never log values."
            to="/standard"
          />
        </section>
      </div>
    </AppShell>
  );
}
function DashboardStats() {
  const [stats, setStats] = useState<{
    catalog_total: number;
    catalog_set: number;
    catalog_missing: number;
    active_tools: number;
    audits_24h: number;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch((e: Error) => setErr(e.message || "Failed to load"));
  }, []);
  if (err) {
    return (
      <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-danger">
        {err}
      </p>
    );
  }
  if (!stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border bg-surface"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        icon={KeyRound}
        label="Catalog"
        value={`${stats.catalog_set}/${stats.catalog_total}`}
        hint="SET / total names"
      />
      <Stat
        icon={CircleDashed}
        label="Missing"
        value={String(stats.catalog_missing)}
        hint="Need operator write"
      />
      <Stat
        icon={Wrench}
        label="Active tools"
        value={String(stats.active_tools)}
        hint="Non-revoked tokens"
      />
      <Stat
        icon={CheckCircle2}
        label="Audits (24h)"
        value={String(stats.audits_24h)}
        hint="No values stored"
      />
    </div>
  );
}
function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="size-3.5" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-subtle">{hint}</p>
    </div>
  );
}
function RuleCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
function FlowStep({
  n,
  title,
  body,
  to,
}: {
  n: string;
  title: string;
  body: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group rounded-xl border border-border bg-surface p-4 transition-colors",
        "hover:border-border-strong hover:bg-elevated/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-8 place-items-center rounded-md border border-border bg-elevated text-xs font-semibold tabular-nums text-muted">
            {n}
          </span>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        </div>
        <ArrowRight
          className="mt-1 size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg"
          aria-hidden
        />
      </div>
    </Link>
  );
}
