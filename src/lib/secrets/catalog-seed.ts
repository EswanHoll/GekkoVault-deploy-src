/** Canonical name inventory — names only (git-safe). Values never live here.
 * Prefer ADR-0006: <PROVIDER>_<PURPOSE>__<SCOPE>
 */
export type SeedScope = {
  id: string;
  label: string;
  description: string;
  system_of_record: "aws_sm" | "supabase_vault" | "local_vault";
};
export type SeedSecret = {
  name: string;
  scope_id: string;
  description: string;
  sensitivity: "bootstrap" | "runtime" | "agent_readonly" | "human_only";
};
export const SEED_SCOPES: SeedScope[] = [
  {
    id: "PROJ_GEKKOVAULT",
    label: "GekkoVault",
    description: "This broker’s host + bootstrap keys (Vercel + local encrypted vault).",
    system_of_record: "local_vault",
  },
  {
    id: "PROJ_GEKKOTRADER",
    label: "GekkoTrader",
    description: "Tokyo ECS product runtime — primary system of record: AWS Secrets Manager.",
    system_of_record: "aws_sm",
  },
  {
    id: "PROJ_PORTFOLIO",
    label: "Portfolio / SHARED",
    description: "Cross-app agent tokens (Cloudflare, marketing, Manus/Cursor shared).",
    system_of_record: "supabase_vault",
  },
];
export const SEED_SECRETS: SeedSecret[] = [
  {
    name: "DATABASE_URL__PROJ_GEKKOVAULT",
    scope_id: "PROJ_GEKKOVAULT",
    description: "GekkoVault Postgres (Neon / GekkoDB). Host may alias as DATABASE_URL.",
    sensitivity: "runtime",
  },
  {
    name: "VAULT_MASTER_KEY__PROJ_GEKKOVAULT",
    scope_id: "PROJ_GEKKOVAULT",
    description: "AES master key — the one bootstrap secret for this vault.",
    sensitivity: "bootstrap",
  },
  {
    name: "GEKKOVAULT_BASE_URL__PROJ_GEKKOVAULT",
    scope_id: "PROJ_GEKKOVAULT",
    description: "Public Vercel origin for agent API.",
    sensitivity: "runtime",
  },
  {
    name: "CONTROL_API_URL__PROJ_GEKKOTRADER",
    scope_id: "PROJ_GEKKOTRADER",
    description: "Control plane base URL for smoke / promote flows.",
    sensitivity: "runtime",
  },
  {
    name: "CONTROL_SMOKE_USER__PROJ_GEKKOTRADER",
    scope_id: "PROJ_GEKKOTRADER",
    description: "Smoke login user for control plane checks.",
    sensitivity: "agent_readonly",
  },
  {
    name: "CONTROL_SMOKE_PASS__PROJ_GEKKOTRADER",
    scope_id: "PROJ_GEKKOTRADER",
    description: "Smoke login password — least privilege, rotate often.",
    sensitivity: "agent_readonly",
  },
  {
    name: "DATABASE_URL__PROJ_GEKKOTRADER",
    scope_id: "PROJ_GEKKOTRADER",
    description: "Trader DB URL — apps/ECS only, not Grok/Manus by default.",
    sensitivity: "runtime",
  },
  {
    name: "BINANCE_DEMO_API_KEY__PROJ_GEKKOTRADER",
    scope_id: "PROJ_GEKKOTRADER",
    description: "Demo exchange key — never grant to unrestricted agents.",
    sensitivity: "runtime",
  },
  {
    name: "BINANCE_DEMO_API_SECRET__PROJ_GEKKOTRADER",
    scope_id: "PROJ_GEKKOTRADER",
    description: "Demo exchange secret.",
    sensitivity: "runtime",
  },
  {
    name: "AGENT_SHARED_TOKEN__PROJ_PORTFOLIO",
    scope_id: "PROJ_PORTFOLIO",
    description: "Shared read token for portfolio ops across Cursor/Manus.",
    sensitivity: "agent_readonly",
  },
  {
    name: "CLOUDFLARE_API_TOKEN__SHARED",
    scope_id: "PROJ_PORTFOLIO",
    description: "Account-wide CF token (portfolio SHARED tier).",
    sensitivity: "runtime",
  },
];
/** Default allowlists per platform — least privilege. */
export const PLATFORM_DEFAULT_ALLOWLIST: Record<string, string[]> = {
  cursor: [
    "CONTROL_API_URL__PROJ_GEKKOTRADER",
    "CONTROL_SMOKE_USER__PROJ_GEKKOTRADER",
    "CONTROL_SMOKE_PASS__PROJ_GEKKOTRADER",
    "AGENT_SHARED_TOKEN__PROJ_PORTFOLIO",
    "GEKKOVAULT_BASE_URL__PROJ_GEKKOVAULT",
  ],
  grok: [
    "CONTROL_API_URL__PROJ_GEKKOTRADER",
    "CONTROL_SMOKE_USER__PROJ_GEKKOTRADER",
    "CONTROL_SMOKE_PASS__PROJ_GEKKOTRADER",
  ],
  manus: [
    "AGENT_SHARED_TOKEN__PROJ_PORTFOLIO",
    "CONTROL_API_URL__PROJ_GEKKOTRADER",
  ],
  apps: [
    "CONTROL_API_URL__PROJ_GEKKOTRADER",
    "DATABASE_URL__PROJ_GEKKOTRADER",
    "BINANCE_DEMO_API_KEY__PROJ_GEKKOTRADER",
    "BINANCE_DEMO_API_SECRET__PROJ_GEKKOTRADER",
  ],
  ecs: [
    "CONTROL_API_URL__PROJ_GEKKOTRADER",
    "DATABASE_URL__PROJ_GEKKOTRADER",
    "BINANCE_DEMO_API_KEY__PROJ_GEKKOTRADER",
    "BINANCE_DEMO_API_SECRET__PROJ_GEKKOTRADER",
  ],
  github_actions: ["CONTROL_API_URL__PROJ_GEKKOTRADER"],
  custom: [],
};
