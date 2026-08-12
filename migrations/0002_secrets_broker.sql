-- Secrets Broker schema (names in catalog; values encrypted; audit never stores values)

create table if not exists secret_scopes (
  id text primary key,
  label text not null,
  description text not null default '',
  system_of_record text not null default 'local_vault'
    check (system_of_record in ('aws_sm', 'supabase_vault', 'local_vault')),
  created_at timestamptz not null default now()
);

create table if not exists secret_catalog (
  id text primary key,
  name text not null,
  scope_id text not null references secret_scopes(id) on delete cascade,
  description text not null default '',
  sensitivity text not null default 'runtime'
    check (sensitivity in ('bootstrap', 'runtime', 'agent_readonly', 'human_only')),
  owner_user_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, name)
);
create index if not exists secret_catalog_owner_idx on secret_catalog (owner_user_id);
create index if not exists secret_catalog_scope_idx on secret_catalog (scope_id);

create table if not exists secret_values (
  secret_id text primary key references secret_catalog(id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  version int not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text not null
);

create table if not exists tool_clients (
  id text primary key,
  owner_user_id text not null,
  name text not null,
  platform text not null
    check (platform in ('cursor', 'grok', 'manus', 'apps', 'ecs', 'github_actions', 'custom')),
  token_hash text not null,
  token_prefix text not null,
  allowlist jsonb not null default '[]'::jsonb,
  purpose text not null default '',
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists tool_clients_owner_idx on tool_clients (owner_user_id);
create index if not exists tool_clients_token_hash_idx on tool_clients (token_hash);

create table if not exists secret_audit (
  id text primary key,
  owner_user_id text not null,
  tool_client_id text references tool_clients(id) on delete set null,
  actor text not null,
  action text not null
    check (action in ('catalog_list', 'presence_check', 'fetch', 'put', 'delete', 'token_create', 'token_revoke', 'rotate')),
  secret_name text,
  result text not null default 'ok'
    check (result in ('ok', 'missing', 'denied', 'error')),
  purpose text not null default '',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists secret_audit_owner_idx on secret_audit (owner_user_id, created_at desc);
