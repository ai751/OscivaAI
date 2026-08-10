#!/usr/bin/env bash
# One-shot deploy: rate-limit migration + redeploy the `chat` edge function.
# Uses the Supabase Management API (no CLI/Docker needed).
#
# Usage (from the project root):
#   SUPABASE_ACCESS_TOKEN=sbp_xxx bash deploy_rate_limit.sh
#
# Generate the token at: Dashboard -> Account -> Access Tokens. REVOKE it after.

REF="ivmliklvsqmblplkwutq"
API="https://api.supabase.com/v1/projects/$REF"
MIGRATION="supabase/migrations/20260619120000_rate_limit.sql"
FUNC="supabase/functions/chat/index.ts"

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "ERROR: set SUPABASE_ACCESS_TOKEN=sbp_... (Dashboard -> Account -> Access Tokens)"
  exit 1
fi
for f in "$MIGRATION" "$FUNC"; do
  [ -f "$f" ] || { echo "ERROR: missing $f (run from the project root)"; exit 1; }
done
AUTH="Authorization: Bearer $SUPABASE_ACCESS_TOKEN"

echo "==> [1/3] Applying rate-limit migration..."
node -e "const fs=require('fs');process.stdout.write(JSON.stringify({query:fs.readFileSync('$MIGRATION','utf8')}))" > /tmp/osciva_rl_mig.json
curl -sS -X POST "$API/database/query" \
  -H "$AUTH" -H "Content-Type: application/json" \
  --data-binary @/tmp/osciva_rl_mig.json
echo; echo "    (an empty array [] means success)"

echo "==> [2/3] Redeploying the chat function (Verify JWT = OFF)..."
curl -sS -X POST "$API/functions/deploy?slug=chat" \
  -H "$AUTH" \
  -F 'metadata={"entrypoint_path":"index.ts","name":"chat","verify_jwt":false};type=application/json' \
  -F "file=@$FUNC;type=application/typescript"
echo

echo "==> [3/3] Verifying (table + RPC should both be 1)..."
node -e "process.stdout.write(JSON.stringify({query:\"SELECT (SELECT count(*) FROM information_schema.tables WHERE table_name='rate_limit_hits') AS tbl, (SELECT count(*) FROM pg_proc WHERE proname='bump_rate_limit') AS fn;\"}))" > /tmp/osciva_rl_verify.json
curl -sS -X POST "$API/database/query" \
  -H "$AUTH" -H "Content-Type: application/json" \
  --data-binary @/tmp/osciva_rl_verify.json
echo

rm -f /tmp/osciva_rl_mig.json /tmp/osciva_rl_verify.json
echo "==> Done. Now REVOKE the access token in the Supabase dashboard."
