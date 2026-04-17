#!/bin/bash
set -Eeuo pipefail


PORT=5000
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
DEPLOY_RUN_PORT=5000


cd "${COZE_WORKSPACE_PATH}"

kill_port_if_listening() {
    local pids
    pids=$(lsof -tiTCP:"${DEPLOY_RUN_PORT}" -sTCP:LISTEN 2>/dev/null | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
      echo "Port ${DEPLOY_RUN_PORT} is free."
      return
    fi
    echo "Port ${DEPLOY_RUN_PORT} in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs kill -9
    sleep 1
    pids=$(lsof -tiTCP:"${DEPLOY_RUN_PORT}" -sTCP:LISTEN 2>/dev/null | paste -sd' ' - || true)
    if [[ -n "${pids}" ]]; then
      echo "Warning: port ${DEPLOY_RUN_PORT} still busy after SIGKILL, PIDs: ${pids}"
    else
      echo "Port ${DEPLOY_RUN_PORT} cleared."
    fi
}

clear_next_lock() {
    local lock_path=".next/dev/lock"
    local lock_pids
    if [[ ! -e "${lock_path}" ]]; then
      return
    fi

    lock_pids=$(lsof -t "${lock_path}" 2>/dev/null | sort -u | paste -sd' ' - || true)
    if [[ -n "${lock_pids}" ]]; then
      echo "Next.js lock is held by PIDs: ${lock_pids} (SIGKILL)"
      echo "${lock_pids}" | xargs kill -9
      sleep 1
    fi

    rm -f "${lock_path}"
    echo "Cleared stale Next.js lock: ${lock_path}"
}

echo "Clearing port ${PORT} before start."
kill_port_if_listening
clear_next_lock
echo "Starting HTTP service on port ${PORT} for dev..."

PORT=$PORT pnpm tsx watch src/server.ts
