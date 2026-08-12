#!/usr/bin/env python
"""Copy all data from one Supabase project into another, row for row.

Reads every table over the Management API `/database/query` endpoint (which runs
as the postgres role, so RLS never hides rows) and replays it into the target.
Column lists are intersected between source and target and tables are ordered by
their foreign keys, so the copy survives minor schema drift between the two.

    OLD_TOKEN=sbp_... NEW_TOKEN=sbp_... python migrate_data.py --dry-run
    OLD_TOKEN=sbp_... NEW_TOKEN=sbp_... python migrate_data.py --go

`--dry-run` only reports row counts on both sides and the copy order it would
use. Nothing is written without `--go`.
"""

import json
import os
import sys
import urllib.error
import urllib.request

OLD_REF = os.environ.get("OLD_REF", "ydvzfinuypdjkfnzdpkt")
NEW_REF = os.environ.get("NEW_REF", "ivmliklvsqmblplkwutq")
OLD_TOKEN = os.environ.get("OLD_TOKEN", "")
NEW_TOKEN = os.environ.get("NEW_TOKEN", "")

# auth tables come first and in this order: identities point at users.
AUTH_TABLES = [("auth", "users"), ("auth", "identities")]

# Rows are shipped in batches so a single request never carries a huge payload.
BATCH = 250


def query(ref, token, sql):
    """POST one SQL statement to the Management API, returning parsed rows."""
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{ref}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode()
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode()[:400]
        raise SystemExit(f"  !! {ref} HTTP {exc.code}: {detail}\n     SQL: {sql[:160]}")
    return json.loads(body) if body.strip() else []


def columns(ref, token, schema, table):
    rows = query(
        ref,
        token,
        f"""select column_name from information_schema.columns
            where table_schema = '{schema}' and table_name = '{table}'
              and is_generated = 'NEVER' and identity_generation is null
            order by ordinal_position;""",
    )
    return [r["column_name"] for r in rows]


def public_tables_in_fk_order(ref, token):
    """Topologically sort public tables so parents are inserted before children."""
    tables = [
        r["table_name"]
        for r in query(
            ref,
            token,
            """select table_name from information_schema.tables
               where table_schema = 'public' and table_type = 'BASE TABLE'
               order by table_name;""",
        )
    ]
    deps = {t: set() for t in tables}
    for row in query(
        ref,
        token,
        """select src.relname as child, tgt.relname as parent
           from pg_constraint c
           join pg_class src on src.oid = c.conrelid
           join pg_class tgt on tgt.oid = c.confrelid
           join pg_namespace n on n.oid = src.relnamespace
           where c.contype = 'f' and n.nspname = 'public';""",
    ):
        child, parent = row["child"], row["parent"]
        # Self-references resolve within a single insert, so they are not edges.
        if child in deps and parent in tables and child != parent:
            deps[child].add(parent)

    ordered, remaining = [], dict(deps)
    while remaining:
        ready = sorted(t for t, parents in remaining.items() if not (parents - set(ordered)))
        if not ready:  # a cycle: emit the rest alphabetically and let FKs sort it out
            ordered.extend(sorted(remaining))
            break
        ordered.extend(ready)
        for t in ready:
            remaining.pop(t)
    return ordered


def count(ref, token, schema, table):
    rows = query(ref, token, f"select count(*)::int as n from {schema}.{table};")
    return rows[0]["n"] if rows else 0


def copy_table(schema, table, dry_run):
    src_cols = set(columns(OLD_REF, OLD_TOKEN, schema, table))
    dst_cols = columns(NEW_REF, NEW_TOKEN, schema, table)
    shared = [c for c in dst_cols if c in src_cols]
    if not shared:
        print(f"  -- {schema}.{table}: no shared columns, skipped")
        return 0, 0

    n_old = count(OLD_REF, OLD_TOKEN, schema, table)
    dropped = sorted(set(dst_cols) - src_cols) + sorted(src_cols - set(dst_cols))
    note = f"  (columns not in both, skipped: {', '.join(dropped)})" if dropped else ""
    print(f"  -> {schema}.{table}: {n_old} rows{note}")
    if dry_run or n_old == 0:
        return n_old, 0

    query(NEW_REF, NEW_TOKEN, f"delete from {schema}.{table};")

    col_list = ", ".join(f'"{c}"' for c in shared)
    written = 0
    for offset in range(0, n_old, BATCH):
        rows = query(
            OLD_REF,
            OLD_TOKEN,
            f"""select coalesce(json_agg(t), '[]'::json)::text as data from (
                    select {col_list} from {schema}.{table}
                    order by 1 offset {offset} limit {BATCH}
                ) t;""",
        )
        payload = rows[0]["data"]
        if payload.strip() in ("[]", ""):
            break
        # Dollar-quoting sidesteps every quote-escaping problem in the JSON body.
        tag = "$osciva$"
        if tag in payload:
            raise SystemExit(f"  !! {schema}.{table}: payload contains the quote tag")
        query(
            NEW_REF,
            NEW_TOKEN,
            f"""insert into {schema}.{table} ({col_list})
                select {col_list}
                from json_populate_recordset(null::{schema}.{table},
                                             {tag}{payload}{tag}::json);""",
        )
        written += min(BATCH, n_old - offset)
        print(f"     .. {written}/{n_old}")
    return n_old, written


def main():
    dry_run = "--go" not in sys.argv
    if not OLD_TOKEN or not NEW_TOKEN:
        raise SystemExit("Set OLD_TOKEN and NEW_TOKEN in the environment.")

    print(f"source: {OLD_REF}\ntarget: {NEW_REF}")
    print("MODE: DRY RUN (nothing is written)\n" if dry_run else "MODE: LIVE COPY\n")

    order = public_tables_in_fk_order(NEW_REF, NEW_TOKEN)
    plan = AUTH_TABLES + [("public", t) for t in order]

    if not dry_run:
        print("disabling on_auth_user_created so the signup trigger cannot fight the copy")
        query(NEW_REF, NEW_TOKEN, "alter table auth.users disable trigger on_auth_user_created;")

    results = []
    try:
        for schema, table in plan:
            results.append((schema, table) + copy_table(schema, table, dry_run))
    finally:
        if not dry_run:
            print("\nre-enabling on_auth_user_created")
            query(NEW_REF, NEW_TOKEN, "alter table auth.users enable trigger on_auth_user_created;")

    print("\n=== VERIFY (source vs target) ===")
    bad = 0
    for schema, table, n_old, _ in results:
        n_new = count(NEW_REF, NEW_TOKEN, schema, table)
        ok = "OK " if n_new == n_old else "MISMATCH"
        if n_new != n_old and not dry_run:
            bad += 1
        print(f"  {ok:9} {schema}.{table:<24} old={n_old:<7} new={n_new}")
    if dry_run:
        print("\nDry run only. Re-run with --go to perform the copy.")
    elif bad:
        raise SystemExit(f"\n{bad} table(s) did not match. Nothing was dropped on the source.")
    else:
        print("\nEvery table matches. Source project untouched.")


if __name__ == "__main__":
    main()
