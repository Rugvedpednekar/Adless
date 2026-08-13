#!/usr/bin/env bash
set -Eeuo pipefail

PUBLIC_PORT="${PORT:-8080}"
if [[ ! "$PUBLIC_PORT" =~ ^[0-9]+$ ]] || (( PUBLIC_PORT < 1 || PUBLIC_PORT > 65535 )); then
  echo "PORT must be a valid TCP port" >&2
  exit 2
fi

sed "s/__PORT__/${PUBLIC_PORT}/g" /etc/nginx/nginx.conf.template > /tmp/nginx.conf
nginx -t -c /tmp/nginx.conf

pids=()
shutdown() {
  trap - EXIT INT TERM
  if ((${#pids[@]})); then
    kill -TERM "${pids[@]}" 2>/dev/null || true
    wait "${pids[@]}" 2>/dev/null || true
  fi
}
trap shutdown EXIT INT TERM

(cd /app/backend && uvicorn app.main:app --host 127.0.0.1 --port 8000 --proxy-headers --forwarded-allow-ips=127.0.0.1) &
pids+=("$!")
(cd /app/frontend && HOSTNAME=127.0.0.1 PORT=3000 node server.js) &
pids+=("$!")
nginx -c /tmp/nginx.conf -g 'daemon off;' &
pids+=("$!")

set +e
wait -n "${pids[@]}"
status=$?
set -e
echo "A critical Adless process exited with status ${status}; stopping container." >&2
if (( status == 0 )); then status=1; fi
exit "$status"
