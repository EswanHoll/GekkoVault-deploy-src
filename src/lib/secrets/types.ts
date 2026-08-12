export type Presence = "SET" | "MISSING";
export type CatalogRow = {
  id: string;
  name: string;
  scope_id: string;
  description: string;
  sensitivity: string;
  presence: Presence;
  system_of_record: string;
  scope_label: string;
  updated_at: string | null;
};
export type ToolClientRow = {
  id: string;
  name: string;
  platform: string;
  token_prefix: string;
  allowlist: string[];
  purpose: string;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
  last_used_at: string | null;
};
export type AuditRow = {
  id: string;
  actor: string;
  action: string;
  secret_name: string | null;
  result: string;
  purpose: string;
  created_at: string;
  tool_name: string | null;
};
