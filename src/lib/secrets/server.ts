import { getSql } from "@/lib/db";
import {
  decryptSecret,
  encryptSecret,
  hashToken,
  mintToolToken,
  newId,
} from "./crypto";
import {
  PLATFORM_DEFAULT_ALLOWLIST,
  SEED_SCOPES,
  SEED_SECRETS,
} from "./catalog-seed";
import type { AuditRow, CatalogRow, Presence, ToolClientRow } from "./types";
export type { AuditRow, CatalogRow, Presence, ToolClientRow };
async function audit(
  ownerUserId: string,
  entry: {
    toolClientId?: string | null;
    actor: string;
    action: string;
    secretName?: string | null;
    result?: string;
    purpose?: string;
    meta?: Record<string, unknown>;
  },
) {
  const sql = await getSql();
  await sql`
    insert into secret_audit (
      id, owner_user_id, tool_client_id, actor, action, secret_name, result, purpose, meta
    ) values (
      ${newId("aud")},
      ${ownerUserId},
      ${entry.toolClientId ?? null},
      ${entry.actor},
      ${entry.action},
      ${entry.secretName ?? null},
      ${entry.result ?? "ok"},
      ${entry.purpose ?? ""},
      ${JSON.stringify(entry.meta ?? {})}
    )
  `;
}
export async function ensureSeedCatalog(ownerUserId: string) {
  const sql = await getSql();
  for (const s of SEED_SCOPES) {
    await sql`
      insert into secret_scopes (id, label, description, system_of_record)
      values (${s.id}, ${s.label}, ${s.description}, ${s.system_of_record})
      on conflict (id) do update set
        label = excluded.label,
        description = excluded.description,
        system_of_record = excluded.system_of_record
    `;
  }
  const existing = await sql<{ name: string }>`
    select name from secret_catalog where owner_user_id = ${ownerUserId}
  `;
  const have = new Set(existing.map((r) => r.name));
  for (const sec of SEED_SECRETS) {
    if (have.has(sec.name)) continue;
    await sql`
      insert into secret_catalog (
        id, name, scope_id, description, sensitivity, owner_user_id
      ) values (
        ${newId("sec")},
        ${sec.name},
        ${sec.scope_id},
        ${sec.description},
        ${sec.sensitivity},
        ${ownerUserId}
      )
    `;
  }
}
export async function listCatalog(ownerUserId: string): Promise<CatalogRow[]> {
  await ensureSeedCatalog(ownerUserId);
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    scope_id: string;
    description: string;
    sensitivity: string;
    system_of_record: string;
    scope_label: string;
    has_value: boolean;
    updated_at: string | null;
  }>`
    select
      c.id,
      c.name,
      c.scope_id,
      c.description,
      c.sensitivity,
      s.system_of_record,
      s.label as scope_label,
      (v.secret_id is not null) as has_value,
      v.updated_at::text as updated_at
    from secret_catalog c
    join secret_scopes s on s.id = c.scope_id
    left join secret_values v on v.secret_id = c.id
    where c.owner_user_id = ${ownerUserId}
    order by c.scope_id, c.name
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    scope_id: r.scope_id,
    description: r.description,
    sensitivity: r.sensitivity,
    presence: r.has_value ? "SET" : "MISSING",
    system_of_record: r.system_of_record,
    scope_label: r.scope_label,
    updated_at: r.updated_at,
  }));
}
export async function putSecretValue(
  ownerUserId: string,
  secretName: string,
  value: string,
) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Value required");
  if (trimmed.length > 16_000) throw new Error("Value too large");
  const sql = await getSql();
  await ensureSeedCatalog(ownerUserId);
  const [row] = await sql<{ id: string }>`
    select id from secret_catalog
    where owner_user_id = ${ownerUserId} and name = ${secretName}
  `;
  if (!row) throw new Error("Unknown secret name — add it to the catalog first");
  const { ciphertext, iv } = encryptSecret(trimmed);
  await sql`
    insert into secret_values (secret_id, ciphertext, iv, version, updated_by)
    values (${row.id}, ${ciphertext}, ${iv}, 1, ${ownerUserId})
    on conflict (secret_id) do update set
      ciphertext = excluded.ciphertext,
      iv = excluded.iv,
      version = secret_values.version + 1,
      updated_at = now(),
      updated_by = excluded.updated_by
  `;
  await audit(ownerUserId, {
    actor: "operator",
    action: "put",
    secretName,
    result: "ok",
    purpose: "operator_write",
  });
  return { name: secretName, presence: "SET" as const };
}
export async function deleteSecretValue(ownerUserId: string, secretName: string) {
  const sql = await getSql();
  const [row] = await sql<{ id: string }>`
    select id from secret_catalog
    where owner_user_id = ${ownerUserId} and name = ${secretName}
  `;
  if (!row) throw new Error("Unknown secret");
  await sql`delete from secret_values where secret_id = ${row.id}`;
  await audit(ownerUserId, {
    actor: "operator",
    action: "delete",
    secretName,
    result: "ok",
  });
  return { name: secretName, presence: "MISSING" as const };
}
export async function addCatalogEntry(
  ownerUserId: string,
  input: {
    name: string;
    scope_id: string;
    description?: string;
    sensitivity?: string;
  },
) {
  const name = input.name.trim().toUpperCase().replace(/\s+/g, "_");
  if (!/^[A-Z0-9_]+$/.test(name) || name.length < 3) {
    throw new Error("Name must be UPPER_SNAKE_CASE (letters, digits, _)");
  }
  const sql = await getSql();
  await ensureSeedCatalog(ownerUserId);
  const [scope] = await sql<{ id: string }>`
    select id from secret_scopes where id = ${input.scope_id}
  `;
  if (!scope) throw new Error("Unknown scope");
  await sql`
    insert into secret_catalog (
      id, name, scope_id, description, sensitivity, owner_user_id
    ) values (
      ${newId("sec")},
      ${name},
      ${input.scope_id},
      ${input.description?.trim() ?? ""},
      ${input.sensitivity ?? "runtime"},
      ${ownerUserId}
    )
    on conflict (owner_user_id, name) do update set
      description = excluded.description,
      sensitivity = excluded.sensitivity,
      updated_at = now()
  `;
  return listCatalog(ownerUserId);
}
export async function createToolClient(
  ownerUserId: string,
  input: {
    name: string;
    platform: string;
    allowlist?: string[];
    purpose?: string;
    ttlHours?: number;
  },
) {
  const platform = input.platform;
  if (!(platform in PLATFORM_DEFAULT_ALLOWLIST)) {
    throw new Error("Invalid platform");
  }
  const allowlist =
    input.allowlist && input.allowlist.length > 0
      ? input.allowlist
      : PLATFORM_DEFAULT_ALLOWLIST[platform] ?? [];
  const { token, prefix, hash } = mintToolToken();
  const id = newId("tool");
  const ttl = Math.min(Math.max(input.ttlHours ?? 24, 1), 24 * 30);
  const expiresAt = new Date(Date.now() + ttl * 3600_000).toISOString();
  const sql = await getSql();
  await sql`
    insert into tool_clients (
      id, owner_user_id, name, platform, token_hash, token_prefix,
      allowlist, purpose, expires_at
    ) values (
      ${id},
      ${ownerUserId},
      ${input.name.trim() || platform},
      ${platform},
      ${hash},
      ${prefix},
      ${JSON.stringify(allowlist)},
      ${input.purpose?.trim() ?? ""},
      ${expiresAt}
    )
  `;
  await audit(ownerUserId, {
    actor: "operator",
    action: "token_create",
    toolClientId: id,
    result: "ok",
    purpose: input.purpose ?? "",
    meta: { platform, allowlist_count: allowlist.length },
  });
  return {
    id,
    token,
    prefix,
    platform,
    allowlist,
    expires_at: expiresAt,
  };
}
export async function listToolClients(ownerUserId: string): Promise<ToolClientRow[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    platform: string;
    token_prefix: string;
    allowlist: string | string[];
    purpose: string;
    expires_at: string | null;
    revoked_at: string | null;
    created_at: string;
    last_used_at: string | null;
  }>`
    select
      id, name, platform, token_prefix, allowlist, purpose,
      expires_at::text as expires_at,
      revoked_at::text as revoked_at,
      created_at::text as created_at,
      last_used_at::text as last_used_at
    from tool_clients
    where owner_user_id = ${ownerUserId}
    order by created_at desc
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    platform: r.platform,
    token_prefix: r.token_prefix,
    allowlist: Array.isArray(r.allowlist)
      ? r.allowlist
      : (JSON.parse(String(r.allowlist || "[]")) as string[]),
    purpose: r.purpose,
    expires_at: r.expires_at,
    revoked_at: r.revoked_at,
    created_at: r.created_at,
    last_used_at: r.last_used_at,
  }));
}
export async function revokeToolClient(ownerUserId: string, toolId: string) {
  const sql = await getSql();
  await sql`
    update tool_clients
    set revoked_at = now()
    where id = ${toolId} and owner_user_id = ${ownerUserId} and revoked_at is null
  `;
  await audit(ownerUserId, {
    actor: "operator",
    action: "token_revoke",
    toolClientId: toolId,
    result: "ok",
  });
}
export async function listAudit(ownerUserId: string, limit = 80): Promise<AuditRow[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    actor: string;
    action: string;
    secret_name: string | null;
    result: string;
    purpose: string;
    created_at: string;
    tool_name: string | null;
  }>`
    select
      a.id,
      a.actor,
      a.action,
      a.secret_name,
      a.result,
      a.purpose,
      a.created_at::text as created_at,
      t.name as tool_name
    from secret_audit a
    left join tool_clients t on t.id = a.tool_client_id
    where a.owner_user_id = ${ownerUserId}
    order by a.created_at desc
    limit ${limit}
  `;
  return rows;
}
type ResolvedTool = {
  id: string;
  owner_user_id: string;
  name: string;
  platform: string;
  allowlist: string[];
};
async function resolveToolToken(bearer: string): Promise<ResolvedTool | null> {
  if (!bearer.startsWith("sb_")) return null;
  const hash = hashToken(bearer);
  const sql = await getSql();
  const [row] = await sql<{
    id: string;
    owner_user_id: string;
    name: string;
    platform: string;
    allowlist: string | string[];
    expires_at: string | null;
    revoked_at: string | null;
  }>`
    select id, owner_user_id, name, platform, allowlist,
      expires_at::text as expires_at, revoked_at::text as revoked_at
    from tool_clients
    where token_hash = ${hash}
    limit 1
  `;
  if (!row) return null;
  if (row.revoked_at) return null;
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return null;
  await sql`
    update tool_clients set last_used_at = now() where id = ${row.id}
  `;
  const allowlist = Array.isArray(row.allowlist)
    ? row.allowlist
    : (JSON.parse(String(row.allowlist || "[]")) as string[]);
  return {
    id: row.id,
    owner_user_id: row.owner_user_id,
    name: row.name,
    platform: row.platform,
    allowlist,
  };
}
export async function agentPresenceCheck(
  bearer: string,
  names: string[],
  purpose = "",
): Promise<{ name: string; presence: Presence }[]> {
  const tool = await resolveToolToken(bearer);
  if (!tool) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  const sql = await getSql();
  const results: { name: string; presence: Presence }[] = [];
  for (const name of names) {
    if (!tool.allowlist.includes(name)) {
      await audit(tool.owner_user_id, {
        toolClientId: tool.id,
        actor: `tool:${tool.platform}`,
        action: "presence_check",
        secretName: name,
        result: "denied",
        purpose,
      });
      results.push({ name, presence: "MISSING" });
      continue;
    }
    const [row] = await sql<{ has_value: boolean }>`
      select (v.secret_id is not null) as has_value
      from secret_catalog c
      left join secret_values v on v.secret_id = c.id
      where c.owner_user_id = ${tool.owner_user_id} and c.name = ${name}
    `;
    const presence: Presence = row?.has_value ? "SET" : "MISSING";
    await audit(tool.owner_user_id, {
      toolClientId: tool.id,
      actor: `tool:${tool.platform}`,
      action: "presence_check",
      secretName: name,
      result: presence === "SET" ? "ok" : "missing",
      purpose,
    });
    results.push({ name, presence });
  }
  return results;
}
export async function agentFetch(
  bearer: string,
  names: string[],
  purpose = "",
): Promise<{ name: string; value: string | null; presence: Presence }[]> {
  const tool = await resolveToolToken(bearer);
  if (!tool) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  const sql = await getSql();
  const out: { name: string; value: string | null; presence: Presence }[] = [];
  for (const name of names) {
    if (!tool.allowlist.includes(name)) {
      await audit(tool.owner_user_id, {
        toolClientId: tool.id,
        actor: `tool:${tool.platform}`,
        action: "fetch",
        secretName: name,
        result: "denied",
        purpose,
      });
      out.push({ name, value: null, presence: "MISSING" });
      continue;
    }
    const [row] = await sql<{ ciphertext: string; iv: string }>`
      select v.ciphertext, v.iv
      from secret_catalog c
      join secret_values v on v.secret_id = c.id
      where c.owner_user_id = ${tool.owner_user_id} and c.name = ${name}
    `;
    if (!row) {
      await audit(tool.owner_user_id, {
        toolClientId: tool.id,
        actor: `tool:${tool.platform}`,
        action: "fetch",
        secretName: name,
        result: "missing",
        purpose,
      });
      out.push({ name, value: null, presence: "MISSING" });
      continue;
    }
    let value: string;
    try {
      value = decryptSecret(row.ciphertext, row.iv);
    } catch {
      await audit(tool.owner_user_id, {
        toolClientId: tool.id,
        actor: `tool:${tool.platform}`,
        action: "fetch",
        secretName: name,
        result: "error",
        purpose,
      });
      out.push({ name, value: null, presence: "MISSING" });
      continue;
    }
    await audit(tool.owner_user_id, {
      toolClientId: tool.id,
      actor: `tool:${tool.platform}`,
      action: "fetch",
      secretName: name,
      result: "ok",
      purpose,
    });
    out.push({ name, value, presence: "SET" });
  }
  return out;
}
export async function dashboardStats(ownerUserId: string) {
  await ensureSeedCatalog(ownerUserId);
  const sql = await getSql();
  const [cat] = await sql<{ total: number; set_count: number }>`
    select
      count(*)::int as total,
      count(v.secret_id)::int as set_count
    from secret_catalog c
    left join secret_values v on v.secret_id = c.id
    where c.owner_user_id = ${ownerUserId}
  `;
  const [tools] = await sql<{ active: number }>`
    select count(*)::int as active from tool_clients
    where owner_user_id = ${ownerUserId}
      and revoked_at is null
      and (expires_at is null or expires_at > now())
  `;
  const [aud] = await sql<{ n: number }>`
    select count(*)::int as n from secret_audit
    where owner_user_id = ${ownerUserId}
      and created_at > now() - interval '24 hours'
  `;
  return {
    catalog_total: cat?.total ?? 0,
    catalog_set: cat?.set_count ?? 0,
    catalog_missing: (cat?.total ?? 0) - (cat?.set_count ?? 0),
    active_tools: tools?.active ?? 0,
    audits_24h: aud?.n ?? 0,
  };
}
export { PLATFORM_DEFAULT_ALLOWLIST, SEED_SCOPES };
