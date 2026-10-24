#!/usr/bin/env bash
# build + redeploy Posta, then prove it is serving the new build.
set -uo pipefail
cd /root/posta-revive

echo "== build =="
/root/posta-serve.sh build 2>&1 | tail -4
BUILD=${PIPESTATUS[0]:-$?}
if [ "${BUILD:-0}" -ne 0 ]; then echo "BUILD FAILED — not touching the running server"; exit 1; fi

echo "== restart =="
PIDS=$(ss -lptn 'sport = :3008' 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u)
for P in $PIDS; do kill "$P" 2>/dev/null && echo "  stopped $P"; done
sleep 3
nohup /root/posta-serve.sh start > /root/posta-server.log 2>&1 &
echo "  started, waiting for readiness"
for i in $(seq 1 40); do
  if grep -q "Ready in" /root/posta-server.log 2>/dev/null; then echo "  ready after ${i}s"; break; fi
  sleep 1
done

echo "== health =="
for p in / /login /signup /dashboard /privacy /terms /cookies /refund /contact; do
  printf "  %-10s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' "https://posta.digitalwavetech.dev$p")"
done

echo "== brand checker (rendered) =="
for p in / /login /signup /dashboard; do
  printf "  %-11s " "$p"
  timeout 120 python3 design-system/posta/scripts/check-brand.py --url "https://posta.digitalwavetech.dev$p" 2>&1 | head -4 | tr '\n' ' '
  echo
done
echo "== done =="
