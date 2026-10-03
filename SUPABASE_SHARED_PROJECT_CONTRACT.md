# Shared Supabase Contract · Editorial ecosystem

This document defines how other apps can connect to the same Supabase project as Editorial OS without exposing secrets or corrupting shared state.

## 1. Credentials

Reuse the same Supabase **Project URL** and **publishable/anon key** already configured for Editorial OS.

Do not commit passwords, service-role keys, refresh tokens, private signing keys, or `.env` files containing secrets.

For browser/PWA apps, expose only the public project URL and publishable/anon key through an app-local configuration file such as:

```js
window.EDITORIAL_SUPABASE = {
  url: 'YOUR_SUPABASE_PROJECT_URL',
  key: 'YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY'
};
```

## 2. Auth

Editorial OS uses Supabase Auth with email/password and a persistent client session:

```js
const client = supabase.createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

Sign-in pattern:

```js
await client.auth.signInWithPassword({ email, password });
```

Every state row is scoped to `session.user.id`.

## 3. Shared table

Editorial OS currently reads and writes:

```text
public.editorial_state
```

Required logical columns:

```text
user_id       uuid/text identity of the authenticated Supabase user
workspace_key text
payload       json/jsonb
updated_at    timestamp/timestamptz
```

Editorial OS performs an upsert using the composite conflict target:

```text
user_id,workspace_key
```

Therefore the table must have a UNIQUE or PRIMARY KEY constraint covering those columns.

Reference schema for a fresh project only:

```sql
create table if not exists public.editorial_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_key text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_key)
);

alter table public.editorial_state enable row level security;

create policy "editorial_state_select_own"
on public.editorial_state
for select
to authenticated
using (auth.uid() = user_id);

create policy "editorial_state_insert_own"
on public.editorial_state
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "editorial_state_update_own"
on public.editorial_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "editorial_state_delete_own"
on public.editorial_state
for delete
to authenticated
using (auth.uid() = user_id);
```

Do not re-run or replace the production table blindly. Inspect the real Supabase project first.

## 4. Workspace strategy

There are two valid modes.

### A. App needs the SAME Editorial OS state

Use:

```text
workspace_key = editorial-os
```

This is required for apps such as Editorial Emulator that must share brands, planner, scenarios, notes, production state, etc.

The app must understand and preserve the shared payload contract.

### B. App uses the SAME Supabase project but needs independent state

Use a different stable workspace key, for example:

```text
abraxas-publisher
abraxas-dresser
abraxas-canter
```

This lets the app reuse the same Supabase project/Auth/table while avoiding collisions with Editorial OS.

Never reuse `editorial-os` for an unrelated payload format.

## 5. Editorial OS payload contract

Current compatible payload root:

```js
{
  version: 9,
  state,
  appData,
  savedScenarios,
  plannerDraft,
  syncMeta: {
    revision,
    baseRevision,
    deviceId,
    productVersion,
    updatedAt
  }
}
```

Important existing branches include data such as:

```text
state
appData
savedScenarios
plannerDraft
syncMeta
```

`appData` may contain newer branches unknown to an older client, for example production state, custom content, brands, pillars, families, history, content notes, and future additions.

## 6. Non-destructive write rule

Any secondary app using `workspace_key = editorial-os` must NOT construct a partial payload and overwrite the row.

Safe sequence:

1. authenticate;
2. fetch the current remote row;
3. keep the complete remote payload;
4. modify only the branches/fields owned by the current app;
5. preserve unknown fields;
6. increment sync revision;
7. upsert the merged payload.

Conceptual example:

```js
const { data } = await client
  .from('editorial_state')
  .select('payload,updated_at')
  .eq('user_id', session.user.id)
  .eq('workspace_key', 'editorial-os')
  .maybeSingle();

const remote = data?.payload || {};

const merged = {
  ...remote,
  plannerDraft: newPlannerDraft,
  savedScenarios: newSavedScenarios,
  syncMeta: nextSyncMeta(remote.syncMeta)
};

await client.from('editorial_state').upsert({
  user_id: session.user.id,
  workspace_key: 'editorial-os',
  payload: merged,
  updated_at: new Date().toISOString()
}, {
  onConflict: 'user_id,workspace_key'
});
```

## 7. Current Editorial OS conflict model

Editorial OS keeps:

```text
revision
baseRevision
deviceId
dirty state
```

Before accepting a remote payload it checks whether another device has advanced the remote revision beyond the local base revision.

A secondary app that writes to the shared `editorial-os` workspace should keep compatible `syncMeta` semantics instead of resetting those fields.

Recommended next revision:

```js
nextRevision = Math.max(
  localRevision || 0,
  baseRevision || 0,
  remoteRevision || 0
) + 1;
```

## 8. Realtime

Editorial OS subscribes to updates on `public.editorial_state` filtered by the authenticated user:

```js
client
  .channel(`editorial-${session.user.id}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'editorial_state',
      filter: `user_id=eq.${session.user.id}`
    },
    payload => {
      if (payload.new?.payload) applyRemotePayload(payload.new.payload);
    }
  )
  .subscribe();
```

A new app can use the same pattern when live synchronization is useful.

## 9. Local storage compatibility for Editorial apps

Editorial OS currently preserves these browser keys:

```text
jocEditorialV9
jocEditorialV9AppData
jocEditorialV9Scenarios
jocEditorialV9Cloud
```

Additional sync metadata may also exist locally.

Only apps intentionally sharing the Editorial OS browser state should reuse these exact keys.

Unrelated apps should use their own local keys even when they use the same Supabase project.

## 10. GitHub Pages origin nuance

GitHub Pages projects published under the same user host, e.g.

```text
https://lordjeferies.github.io/editorial-os/
https://lordjeferies.github.io/editorial-emulator/
```

share the same web origin (`https://lordjeferies.github.io`). Browser localStorage is origin-scoped, not path-scoped. Therefore identical localStorage keys can collide/share intentionally.

Use this deliberately:
- Editorial OS + Editorial Emulator may intentionally share compatible keys.
- unrelated apps should namespace their localStorage keys.

Native WKWebView wrappers have their own WebKit data container; use Supabase as the cross-app/device source of truth rather than assuming Safari/localStorage sharing.

## 11. Recommended contract for a new app

For a new independent app in the same ecosystem:

```text
Supabase project: same project
Auth: same Supabase Auth
Table: public.editorial_state
workspace_key: unique to the app
Payload version: app-specific
RLS: auth.uid() = user_id
Sync: local-first + debounced cloud write
Secrets: never commit service-role/private keys
```

For a new app that must participate directly in Editorial OS data:

```text
Supabase project: same project
Auth: same Supabase Auth
Table: public.editorial_state
workspace_key: editorial-os
Payload root: preserve version 9 compatibility
Writes: read → merge → revision increment → upsert
Unknown branches: always preserve
Realtime: optional but compatible
```

## 12. Source of truth

The production contract is the current `LordJeferies/editorial-os` repository and the actual Supabase project configuration. This document contains no project credentials and must remain safe to share with development chats.