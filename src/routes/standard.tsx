import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";
export const Route = createFileRoute("/standard")({ component: StandardPage });
function StandardPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Standing decision (GekkoStack-aligned)
          </h1>
          <p className="text-sm text-muted">
            Full docs:{" "}
            <a
              className="text-fg underline-offset-4 hover:underline"
              href="https://github.com/EswanHoll/GekkoVault/tree/main/docs/architecture"
            >
              docs/architecture
            </a>{" "}
            · portfolio catalog in GekkoStack{" "}
            <code className="text-fg">docs/SECRETS.md</code>.
          </p>
        </header>
        <Section title="1. Canonical values">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">
            <li>
              <strong className="text-fg">AWS Secrets Manager</strong> for
              GekkoTrader product runtimes (Tokyo ECS).
            </li>
            <li>
              <strong className="text-fg">Supabase Vault (GekkoDB)</strong> for
              portfolio / SHARED agent tokens.
            </li>
            <li>
              <strong className="text-fg">GekkoVault DB</strong> for
              broker-managed secrets + operator UI + agent API.
            </li>
          </ul>
        </Section>
        <Section title="2. Canonical names (ADR-0006)">
          <p className="text-sm text-muted">
            Prefer{" "}
            <code className="text-fg">
              {"<PROVIDER>_<PURPOSE>__<SCOPE>"}
            </code>
            . Example:{" "}
            <code className="break-all text-fg">
              CONTROL_SMOKE_PASS__PROJ_GEKKOTRADER
            </code>
            . Git holds names only.
          </p>
        </Section>
        <Section title="3. Agents">
          <p className="text-sm text-muted">
            Fetch by name at session start with a short-lived tool token.
            Presence checks log SET/MISSING only.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-elevated p-3 font-mono text-xs leading-relaxed text-fg">
            {`# Presence (safe to print)
curl -sS -X POST "$GEKKOVAULT_BASE_URL/api/v1/secrets/check" \\
  -H "Authorization: Bearer $TOOL_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"names":["CONTROL_API_URL__PROJ_GEKKOTRADER"],"purpose":"boot"}'
# Fetch → inject env (do not echo values)
curl -sS -X POST "$GEKKOVAULT_BASE_URL/api/v1/secrets/fetch" \\
  -H "Authorization: Bearer $TOOL_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"names":["CONTROL_SMOKE_USER__PROJ_GEKKOTRADER"],"purpose":"smoke"}'`}
          </pre>
        </Section>
        <Section title="4. Chat">
          <p className="text-sm text-muted">
            Emergency only. If a key is pasted into chat, rotate after. Prefer:
            operator injects via platform secrets UI; Grok architects while
            Cursor or tool tokens hold runtime secrets.
          </p>
        </Section>
        <Section title="5. Host">
          <p className="text-sm text-muted">
            Production: <strong className="text-fg">Vercel</strong> (GekkoTech)
            with <code className="text-fg">DATABASE_URL</code> +{" "}
            <code className="text-fg">VAULT_MASTER_KEY</code>. See{" "}
            <code className="text-fg">docs/SECRETS_INVENTORY.md</code>.
          </p>
        </Section>
      </article>
    </AppShell>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
