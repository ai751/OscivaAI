#!/usr/bin/env python
"""Copy Storage objects between Supabase projects and repoint stored URLs.

`migrate_data.py` copies database rows, but uploaded files live in S3 behind the
Storage API, so their bytes have to be moved separately. This walks every object
in a bucket on the source, re-uploads it to the target, then rewrites any
`agents.logo_url` that still points at the source project's domain.

    OLD_TOKEN=sbp_... NEW_TOKEN=sbp_... NEW_SERVICE_KEY=eyJ... python migrate_storage.py --go

Source objects are only ever read. Without `--go` nothing is uploaded.
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
NEW_SERVICE_KEY = os.environ.get("NEW_SERVICE_KEY", "")
BUCKET = os.environ.get("BUCKET", "agent-logos")

UA = "osciva-migrate/1.0"


def query(ref, token, sql):
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{ref}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": UA,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode()
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"  !! {ref} HTTP {exc.code}: {exc.read().decode()[:300]}")
    return json.loads(body) if body.strip() else []


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req) as resp:
        return resp.read()


def upload(path, blob, mime):
    """PUT overwrites if the object already exists, so re-runs are idempotent."""
    req = urllib.request.Request(
        f"https://{NEW_REF}.supabase.co/storage/v1/object/{BUCKET}/{path}",
        data=blob,
        headers={
            "Authorization": f"Bearer {NEW_SERVICE_KEY}",
            "Content-Type": mime or "application/octet-stream",
            "x-upsert": "true",
            "User-Agent": UA,
        },
        method="PUT",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"  !! upload {path} HTTP {exc.code}: {exc.read().decode()[:300]}")


def main():
    dry_run = "--go" not in sys.argv
    for name, val in (("OLD_TOKEN", OLD_TOKEN), ("NEW_TOKEN", NEW_TOKEN),
                      ("NEW_SERVICE_KEY", NEW_SERVICE_KEY)):
        if not val:
            raise SystemExit(f"Set {name} in the environment.")

    print(f"bucket {BUCKET}: {OLD_REF} -> {NEW_REF}")
    print("MODE: DRY RUN\n" if dry_run else "MODE: LIVE COPY\n")

    objects = query(
        OLD_REF, OLD_TOKEN,
        f"""select name, coalesce(metadata->>'mimetype','application/octet-stream') as mime,
                   coalesce((metadata->>'size')::bigint, 0) as bytes
            from storage.objects where bucket_id = '{BUCKET}' order by name;""",
    )
    print(f"{len(objects)} object(s) on source")

    copied = 0
    for obj in objects:
        src = f"https://{OLD_REF}.supabase.co/storage/v1/object/public/{BUCKET}/{obj['name']}"
        print(f"  -> {obj['name']}  ({obj['bytes']} bytes, {obj['mime']})")
        if dry_run:
            continue
        blob = fetch(src)
        if len(blob) != int(obj["bytes"]):
            print(f"     !! size mismatch: downloaded {len(blob)}, expected {obj['bytes']}")
        upload(obj["name"], blob, obj["mime"])
        copied += 1

    # Any logo_url saved as an absolute URL still names the old project's domain.
    stale = query(
        NEW_REF, NEW_TOKEN,
        f"""select count(*)::int as n from public.agents
            where logo_url like '%{OLD_REF}.supabase.co%';""",
    )[0]["n"]
    print(f"\nagents.logo_url still pointing at {OLD_REF}: {stale}")
    if stale and not dry_run:
        query(
            NEW_REF, NEW_TOKEN,
            f"""update public.agents
                set logo_url = replace(logo_url, '{OLD_REF}.supabase.co', '{NEW_REF}.supabase.co')
                where logo_url like '%{OLD_REF}.supabase.co%';""",
        )
        print("  rewritten to the new project domain")

    if dry_run:
        print("\nDry run only. Re-run with --go.")
        return

    print(f"\n=== VERIFY ===\n  uploaded {copied}/{len(objects)} object(s)")
    n_new = query(
        NEW_REF, NEW_TOKEN,
        f"select count(*)::int as n from storage.objects where bucket_id = '{BUCKET}';",
    )[0]["n"]
    print(f"  objects now on target: {n_new} (source has {len(objects)})")
    left = query(
        NEW_REF, NEW_TOKEN,
        f"select count(*)::int as n from public.agents where logo_url like '%{OLD_REF}%';",
    )[0]["n"]
    print(f"  stale logo_url remaining: {left}")
    if n_new != len(objects) or left:
        raise SystemExit("Mismatch — see above.")
    print("\nStorage matches. Source bucket untouched.")


if __name__ == "__main__":
    main()
