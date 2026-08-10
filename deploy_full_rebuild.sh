#!/usr/bin/env bash
# FULL BACKEND REBUILD onto a fresh Supabase project (account migration).
# Applies every migration in supabase/migrations/ in filename order, then deploys
# both edge functions. Uses the Management API only — no CLI/Docker needed.
#
# Usage (from the project root):
#   SUPABASE_ACCESS_TOKEN=sbp_xxx REF=<new-project-ref> bash deploy_full_rebuild.sh
#
# Safe to re-run: the migrations use IF NOT EXISTS / CREATE OR REPLACE throughout.

set -u
: "${SUPABASE_ACCESS_TOKEN:?set SUPABASE_ACCESS_TOKEN=sbp_... (Dashboard -> Account -> Access Tokens)}"
: "${REF:?set REF=<new project ref>}"

API="https://api.supabase.com/v1/projects/$REF"
AUTH="Authorization: Bearer $SUPABASE_ACCESS_TOKEN"
TMP="${TMPDIR:-/tmp}/osciva_rebuild.json"

[ -d supabase/migrations ] || { echo "ERROR: run from the project root"; exit 1; }

# ---- 1. migrations, in filename order -------------------------------------
fail=0
n=0
for MIG in $(ls supabase/migrations/*.sql | sort); do
  n=$((n+1))
  printf '==> [%02d] %s\n' "$n" "$(basename "$MIG")"
  node -e "const fs=require('fs');process.stdout.write(JSON.stringify({query:fs.readFileSync(process.argv[1],'utf8')}))" "$MIG" > "$TMP"
  OUT=$(curl -sS -X POST "$API/database/query" -H "$AUTH" -H "Content-Type: application/json" --data-binary @"$TMP")
  case "$OUT" in
    '[]'|'{}'|'') echo "    ok" ;;
    *error*|*ERROR*) echo "    FAILED: $OUT"; fail=1 ;;
    *) echo "    ok: $OUT" ;;
  esac
done
[ "$fail" -eq 0 ] || { echo; echo "!! One or more migrations failed — fix before deploying functions."; exit 1; }

# ---- 2. edge functions -----------------------------------------------------
echo
echo "==> Deploying chat (verify_jwt = false) ..."
curl -sS -X POST "$API/functions/deploy?slug=chat" -H "$AUTH" \
  -F 'metadata={"entrypoint_path":"index.ts","name":"chat","verify_jwt":false};type=application/json' \
  -F "file=@supabase/functions/chat/index.ts;type=application/typescript"
echo
echo "==> Deploying ingest (verify_jwt = true) ..."
curl -sS -X POST "$API/functions/deploy?slug=ingest" -H "$AUTH" \
  -F 'metadata={"entrypoint_path":"index.ts","name":"ingest","verify_jwt":true};type=application/json' \
  -F "file=@supabase/functions/ingest/index.ts;type=application/typescript"
echo

# ---- 3. verify -------------------------------------------------------------
echo "==> Verifying schema ..."
node -e "process.stdout.write(JSON.stringify({query:\"SELECT (SELECT count(*) FROM information_schema.tables WHERE table_schema='public') AS public_tables, (SELECT count(*) FROM pg_extension WHERE extname='vector') AS pgvector, (SELECT count(*) FROM storage.buckets WHERE id='agent-logos') AS logo_bucket, (SELECT count(*) FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_admin') AS is_admin_col, (SELECT count(*) FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='notifications') AS realtime_notifications;\"}))" > "$TMP"
curl -sS -X POST "$API/database/query" -H "$AUTH" -H "Content-Type: application/json" --data-binary @"$TMP"
echo

rm -f "$TMP"
cat <<'EOF'

==> Done. Remaining MANUAL steps:
   1. Set the edge-function secret OSCIVA_FREE_OPENAI_KEY (Project Settings ->
      Edge Functions -> Secrets), or free-tier chat will error.
   2. Sign up in the app on the new project, then grant yourself admin:
      UPDATE public.profiles SET is_admin = true WHERE user_id =
        (SELECT id FROM auth.users WHERE email = 'ai@adyatech.com');
   3. REVOKE this access token once everything is verified green.
EOF
