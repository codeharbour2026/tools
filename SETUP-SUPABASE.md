# Connecting Supabase (codeharbour tools)

This site shares the **same Supabase project** as techindustries — same
`SUPABASE_URL`, same `SUPABASE_ANON_KEY`, same `auth.users` and
`profiles` tables. Signing up here creates the same kind of account a
customer would use on techindustries (just with `role = 'customer'`).
`supabase-config.js` in this folder is already filled in with those
same values — you don't need to do anything there unless you move to
a different project later.

All that's needed for this site is two new tables: one for favourite
tools, one for recently opened tools. Run this in the Supabase SQL
Editor:

```sql
create table tool_favorites (
  user_id uuid references profiles(id) on delete cascade not null,
  tool_id text not null,
  created_at timestamptz default now(),
  primary key (user_id, tool_id)
);

alter table tool_favorites enable row level security;

create policy "Users manage their own favorites"
on tool_favorites
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create table tool_recent (
  user_id uuid references profiles(id) on delete cascade not null,
  tool_id text not null,
  opened_at timestamptz default now(),
  primary key (user_id, tool_id)
);

alter table tool_recent enable row level security;

create policy "Users manage their own recent tools"
on tool_recent
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

Both tables use `for all` (one policy covers select/insert/update/
delete) since the rule is simple either way: you can only ever touch
your own rows.

## How it works
- Every tool card on `index.html` has a small star button (top-right
  corner). Clicking it while signed out shows a toast asking you to
  sign in — clicking it while signed in adds/removes a row in
  `tool_favorites`.
- Every time a tool is actually opened (the modal loads), it's
  upserted into `tool_recent` with the current timestamp — this only
  happens if you're signed in; signed-out visitors still use every
  tool exactly as before, nothing changes for them.
- `account.html` reads both tables for the signed-in user and renders
  them as cards using the shared tool catalogue (`tools-catalog.js`)
  for the name/description — clicking a card opens that tool directly
  (`index.html?open=<tool-id>`).
- Tool *data* — assignments, expenses, to-dos, everything inside each
  tool — is unchanged and still lives only in `localStorage`. Nothing
  about what you type into a tool leaves your browser; only the
  favourite/recent *list of tool ids* syncs.

## Hosting note
Same as before: `account.js`, `signin.js`, `signup.js` and
`auth-nav.js` are ES modules, so this needs to be served over
`http://`/`https://`, not opened via `file://`.
