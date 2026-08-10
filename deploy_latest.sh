#!/usr/bin/env bash
# One-shot deploy for the 2026-06-20 work:
#   - agent_access  (password protection)        migration
#   - notifications (realtime bell)              migration
#   - redeploy the `chat` edge function (password + domain enforcement,
#     brute-force throttle, owner notifications)
# Uses the Supabase Management API — no CLI/Docker needed.
#
# Usage (from the project root):
#   SUPABASE_ACCESS_TOKEN=sbp_xxx bash deploy_latest.sh
#
# Get the token at: Supabase Dashboard -> Account -> Access Tokens. REVOKE after.

set -u
REF="ivmliklvsqmblplkwutq"
API="https://api.supabase.com/v1/projects/$REF"
FUNC="supabase/functions/chat/index.ts"
MIGRATIONS=(
  "supabase/migrations/20260620120000_agent_access.sql"
  "supabase/migrations/20260620130000_notifications.sql"
)

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "ERROR: set SUPABASE_ACCESS_TOKEN=sbp_... (Dashboard -> Account -> Access Tokens)"
  exit 1
fi
for f in "${MIGRATIONS[@]}" "$FUNC"; do
  [ -f "$f" ] || { echo "ERROR: missing $f (run from the project root)"; exit 1; }
done

AUTH="Authorization: Bearer $SUPABASE_ACCESS_TOKEN"

n=1
for MIG in "${MIGRATIONS[@]}"; do
  echo "==> [$n] Applying $(basename "$MIG") ..."
  node -e "const fs=require('fs');process.stdout.write(JSON.stringify({query:fs.readFileSync('$MIG','utf8')}))" > /tmp/osciva_mig.json
  curl -sS -X POST "$API/database/query" -H "$AUTH" -H "Content-Type: application/json" --data-binary @/tmp/osciva_mig.json
  echo; echo "    (an empty array [] or {} means success)"
  n=$((n+1))
done

echo "==> [$n] Redeploying the chat function (Verify JWT = OFF) ..."
curl -sS -X POST "$API/functions/deploy?slug=chat" \
  -H "$AUTH" \
  -F 'metadata={"entrypoint_path":"index.ts","name":"chat","verify_jwt":false};type=application/json' \
  -F "file=@$FUNC;type=application/typescript"
echo

echo "==> Verifying (both should be 1) ..."
node -e "process.stdout.write(JSON.stringify({query:\"SELECT (SELECT count(*) FROM information_schema.tables WHERE table_name='agent_access') AS agent_access, (SELECT count(*) FROM information_schema.tables WHERE table_name='notifications') AS notifications;\"}))" > /tmp/osciva_verify.json
curl -sS -X POST "$API/database/query" -H "$AUTH" -H "Content-Type: application/json" --data-binary @/tmp/osciva_verify.json
echo

rm -f /tmp/osciva_mig.json /tmp/osciva_verify.json
echo "==> Done. Now REVOKE the access token in the Supabase dashboard."
