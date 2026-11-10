#!/usr/bin/env bash
#
# Project:   dfe-ui
# File:      scripts/macos-dev-smoke.sh
# Purpose:   Run dfe-engine and the console natively and prove them with a Playwright smoke
#
# License:   BUSL-1.1
# Copyright: (c) 2026 HYPERI PTY LIMITED
#
# Usage:
#   scripts/macos-dev-smoke.sh            # engine from ../dfe-engine, console on 3000
#   DFE_ENGINE_DIR=~/src/dfe-engine CLICKHOUSE=none scripts/macos-dev-smoke.sh
#
# Runs under macOS's stock bash 3.2 and zsh: no GNU-only flags, no associative
# arrays, no `timeout`. The macOS CI job runs this same file. Playwright starts
# the engine and the console (apps/dfe-core-ui/smoke/playwright.config.ts) and
# stops them again, so this script only checks, installs, runs and reports.
#
# Settings (environment):
#   DFE_ENGINE_DIR       dfe-engine checkout (default: ../dfe-engine beside this repo)
#   ENGINE_PORT          default 8003
#   UI_PORT              default 3000 (the engine's CORS list allows 3000, 5173, 5174)
#   ENGINE_METRICS_PORT  the engine's /livez listener, default 19090 (not 9090)
#   CLICKHOUSE           auto | docker | none (default auto: docker when a daemon answers)
#   SMOKE_LOG            the one log file (default .macos-smoke/smoke.log in this repo)

set -euo pipefail

SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
UI_ROOT="$(cd "$(dirname "${SCRIPT_PATH}")/.." && pwd)"
ENGINE_DIR="${DFE_ENGINE_DIR:-${UI_ROOT}/../dfe-engine}"
ENGINE_PORT="${ENGINE_PORT:-8003}"
UI_PORT="${UI_PORT:-3000}"
ENGINE_METRICS_PORT="${ENGINE_METRICS_PORT:-19090}"
CH_PORT="${CLICKHOUSE_HTTP_PORT:-18123}"
CLICKHOUSE="${CLICKHOUSE:-auto}"
# Throwaway for this run: the engine wants a signing secret of 32 bytes or more.
RUN_SECRET="smoke-$(date +%s)-$$-${RANDOM}${RANDOM}${RANDOM}${RANDOM}"

LOG="${SMOKE_LOG:-${UI_ROOT}/.macos-smoke/smoke.log}"
LOG_DIR="$(dirname "${LOG}")"
RESULTS_DIR="${LOG_DIR}/results"
RUN_DIR=""
ENGINE_URL="http://127.0.0.1:${ENGINE_PORT}"
UI_URL="http://localhost:${UI_PORT}"

CH_PROJECT=""
LEGACY_ENV="no"
STEP="start"
RESULT="FAIL"
MISSING=""

log() {
    printf '%s\n' "$*" | tee -a "${LOG}"
}

section() {
    STEP="$1"
    printf '\n===== %s =====\n' "$1" >>"${LOG}"
    printf '==> %s\n' "$1"
}

die() {
    printf 'ERROR: %s\n' "$*" | tee -a "${LOG}"
    exit 1
}

need() {
    MISSING="${MISSING}
  - $1
      $2"
}

# KEY=VALUE lines in, every secret-looking value replaced out.
masked() {
    local line=""
    local key=""
    while IFS= read -r line; do
        key="${line%%=*}"
        case "${key}" in
            *SECRET* | *PASSWORD* | *TOKEN* | *KEY*) printf '%s=<set>\n' "${key}" ;;
            *) printf '%s\n' "${line}" ;;
        esac
    done
}

in_dir() {
    local dir="$1"
    shift
    (cd "${dir}" && "$@")
}

# Run a step's command with its output in the log. On failure show the tail.
run() {
    local label="$1"
    local status=0
    shift
    section "${label}"
    "$@" >>"${LOG}" 2>&1 || status=$?
    if [[ "${status}" -ne 0 ]]; then
        printf 'step "%s" failed (exit %s), last lines:\n' "${label}" "${status}"
        tail -n 15 "${LOG}" | sed 's/^/    /'
        return "${status}"
    fi
}

port_holder() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -nP -iTCP:"$1" -sTCP:LISTEN 2>/dev/null | sed -n '2p' || true
    elif (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; then
        printf 'something (install lsof to see what)'
    fi
}

cleanup() {
    local code=$?
    local port=""
    local leftover=""
    set +e
    trap '' INT TERM HUP
    if [[ -n "${CH_PROJECT}" ]]; then
        env DFE_ENGINE_CLICKHOUSE_PORT="${CH_PORT}" docker compose -p "${CH_PROJECT}" \
            -f "${ENGINE_DIR}/docker-compose.dev.yaml" down -v >>"${LOG}" 2>&1
    fi
    # Playwright stopped the servers when its run ended. Say so if a port still answers.
    for port in "${ENGINE_PORT}" "${UI_PORT}" "${ENGINE_METRICS_PORT}"; do
        if [[ -n "$(port_holder "${port}")" ]]; then
            leftover="${leftover} ${port}"
        fi
    done
    if [[ -n "${leftover}" ]]; then
        printf 'WARNING: still listening after teardown:%s\n' "${leftover}" >>"${LOG}"
    fi
    if [[ "${LEGACY_ENV}" == "yes" ]]; then
        rm -f "${ENGINE_DIR}/.env.e2e"
        if [[ -f "${RUN_DIR}/env.e2e.backup" ]]; then
            mv "${RUN_DIR}/env.e2e.backup" "${ENGINE_DIR}/.env.e2e"
        fi
    fi
    if [[ -n "${RUN_DIR}" ]]; then
        rm -rf "${RUN_DIR}"
    fi
    if [[ "${RESULT}" == "PASS" && "${code}" -eq 0 ]]; then
        printf 'PASS  log: %s\n' "${LOG}"
        exit 0
    fi
    printf 'FAIL (step: %s)  log: %s\n' "${STEP}" "${LOG}"
    exit 1
}

docker_ready() {
    command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

check_prerequisites() {
    local node_major=""
    local ports=""
    local port=""
    local holder=""
    local busy=""
    section "prerequisites"

    command -v git >/dev/null 2>&1 || need "git" "xcode-select --install"
    command -v make >/dev/null 2>&1 || need "make" "xcode-select --install"
    command -v curl >/dev/null 2>&1 || need "curl" "it ships with macOS, check your PATH"
    command -v uv >/dev/null 2>&1 || need "uv" "brew install uv   (or https://docs.astral.sh/uv/getting-started/installation/)"

    if command -v node >/dev/null 2>&1; then
        node_major="$(node -p 'process.versions.node.split(".")[0]')"
        if [[ "${node_major}" -lt 24 ]]; then
            need "node 24 or newer (found $(node -v))" "brew install node@24 && brew link --overwrite node@24   (or fnm / nvm install 24)"
        fi
        command -v corepack >/dev/null 2>&1 || need "corepack (yarn 4 comes through it)" "npm install -g corepack"
    else
        need "node 24 or newer" "brew install node@24 && brew link --overwrite node@24   (or fnm / nvm install 24)"
    fi

    if ! grep -q '^e2e-server:' "${ENGINE_DIR}/Makefile" 2>/dev/null; then
        need "a dfe-engine checkout at ${ENGINE_DIR}" "git clone https://github.com/hyperi-io/dfe-engine.git ${ENGINE_DIR}   (or set DFE_ENGINE_DIR)"
    fi

    case "${CLICKHOUSE}" in
        auto)
            if docker_ready; then
                CLICKHOUSE="docker"
            else
                CLICKHOUSE="none"
            fi
            ;;
        docker)
            docker_ready || need "a running docker daemon (CLICKHOUSE=docker)" "brew install --cask orbstack   (open it once), or set CLICKHOUSE=none"
            ;;
        none) ;;
        *) die "CLICKHOUSE must be auto, docker or none, not '${CLICKHOUSE}'" ;;
    esac

    if [[ -n "${MISSING}" ]]; then
        log "Missing prerequisites:${MISSING}"
        return 1
    fi

    if [[ "${CLICKHOUSE}" == "docker" ]] && ! grep -q '^  clickhouse:' "${ENGINE_DIR}/docker-compose.dev.yaml" 2>/dev/null; then
        log "this dfe-engine has no clickhouse service in docker-compose.dev.yaml: running with no ClickHouse"
        CLICKHOUSE="none"
    fi

    ports="${ENGINE_PORT} ${UI_PORT} ${ENGINE_METRICS_PORT}"
    if [[ "${CLICKHOUSE}" == "docker" ]]; then
        ports="${ports} ${CH_PORT}"
    fi
    for port in ${ports}; do
        holder="$(port_holder "${port}")"
        if [[ -n "${holder}" ]]; then
            busy="${busy}
  - port ${port} is in use: ${holder}"
        fi
    done
    if [[ -n "${busy}" ]]; then
        log "A port is taken (stop it, or set ENGINE_PORT / UI_PORT / ENGINE_METRICS_PORT):${busy}"
        return 1
    fi
    log "prerequisites ok (clickhouse: ${CLICKHOUSE})"
}

record_versions() {
    section "versions"
    {
        printf 'date:       %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        printf 'system:     %s\n' "$(uname -srm)"
        if command -v sw_vers >/dev/null 2>&1; then
            printf 'macOS:      %s\n' "$(sw_vers -productVersion)"
        fi
        printf 'shell:      bash %s\n' "${BASH_VERSION:-none}"
        printf 'uv:         %s\n' "$(uv --version 2>&1)"
        printf 'node:       %s\n' "$(node -v 2>&1)"
        printf 'yarn:       %s\n' "$(cd "${UI_ROOT}" && corepack yarn --version 2>&1 | tail -n 1)"
        printf 'make:       %s\n' "$(make --version 2>&1 | sed -n '1p')"
        printf 'curl:       %s\n' "$(curl --version 2>&1 | sed -n '1p')"
        if docker_ready; then
            printf 'docker:     %s\n' "$(docker version --format '{{.Server.Version}}' 2>&1 | sed -n '1p')"
        else
            printf 'docker:     not available\n'
        fi
        printf 'dfe-ui:     %s %s\n' "$(git -C "${UI_ROOT}" rev-parse --short=12 HEAD 2>&1)" "$(git -C "${UI_ROOT}" describe --tags --always 2>&1)"
        printf 'dfe-engine: %s %s\n' "$(git -C "${ENGINE_DIR}" rev-parse --short=12 HEAD 2>&1)" "$(git -C "${ENGINE_DIR}" describe --tags --always 2>&1)"
        printf 'clickhouse: %s\n' "${CLICKHOUSE}"
    } >>"${LOG}" 2>&1
}

write_engine_env() {
    local file="${RUN_DIR}/engine.env"
    {
        printf 'DFE_ENGINE_ENV=test\n'
        printf 'DFE_ENGINE_API_HOST=127.0.0.1\n'
        printf 'DFE_ENGINE_API_PORT=%s\n' "${ENGINE_PORT}"
        printf 'DFE_ENGINE_API_JWT_SECRET=%s\n' "${RUN_SECRET}"
        printf 'DFE_ENGINE_API_CORS_ORIGINS=http://localhost:%s,http://127.0.0.1:%s\n' "${UI_PORT}" "${UI_PORT}"
        printf 'DFE_ENGINE_AUTH_ENABLED=true\n'
        printf 'DFE_ENGINE_GITOPS_ENABLED=false\n'
        printf 'DFE_ENGINE_TRANSPORT_BUS_PRESENT=false\n'
        printf 'DFE_ENGINE_TRANSPORT_DEFAULT=direct\n'
        printf 'DFE_ENGINE_CLICKHOUSE_HOST=127.0.0.1\n'
        printf 'DFE_ENGINE_CLICKHOUSE_PORT=%s\n' "${CH_PORT}"
        printf 'DFE_ENGINE_CLICKHOUSE_USERNAME=default\n'
        printf 'DFE_ENGINE_CLICKHOUSE_SECURE=false\n'
        printf 'DFE_ENGINE_CLICKHOUSE_VERIFY=false\n'
        if [[ "${CLICKHOUSE}" == "docker" ]]; then
            printf 'DFE_ENGINE_CLICKHOUSE_PASSWORD=ch-%s\n' "${RUN_SECRET}"
            printf 'DFE_ENGINE_CLICKHOUSE_BOOTSTRAP_TABLES=true\n'
        else
            printf 'DFE_ENGINE_CLICKHOUSE_PASSWORD=\n'
            printf 'DFE_ENGINE_CLICKHOUSE_BOOTSTRAP_TABLES=false\n'
            printf 'DFE_ENGINE_TENANT_ISOLATION_ENABLED=false\n'
        fi
        printf 'OTEL_EXPORTER_OTLP_ENDPOINT=" "\n'
        printf 'METRICS_ADDR=127.0.0.1:%s\n' "${ENGINE_METRICS_PORT}"
    } >"${file}"
    section "engine env"
    masked <"${file}" >>"${LOG}"
    # A dfe-engine whose Makefile predates E2E_ENV_FILE reads ./.env.e2e, so the
    # file goes there for the run. A developer's own copy is put back afterwards.
    if ! grep -q '^E2E_ENV_FILE' "${ENGINE_DIR}/Makefile"; then
        LEGACY_ENV="yes"
        if [[ -f "${ENGINE_DIR}/.env.e2e" ]]; then
            mv "${ENGINE_DIR}/.env.e2e" "${RUN_DIR}/env.e2e.backup"
        fi
        cp "${file}" "${ENGINE_DIR}/.env.e2e"
        printf 'engine Makefile has no E2E_ENV_FILE: env placed at %s/.env.e2e for the run\n' "${ENGINE_DIR}" >>"${LOG}"
    fi
}

# The engine repo owns the local ClickHouse: its compose service carries the
# one-node Keeper config the engine's replicated tables need.
start_clickhouse() {
    section "clickhouse (engine docker-compose.dev.yaml)"
    CH_PROJECT="dfe-smoke-$$"
    env DFE_ENGINE_CLICKHOUSE_PORT="${CH_PORT}" DFE_ENGINE_CLICKHOUSE_PASSWORD="ch-${RUN_SECRET}" \
        docker compose -p "${CH_PROJECT}" -f "${ENGINE_DIR}/docker-compose.dev.yaml" \
        up -d --wait clickhouse >>"${LOG}" 2>&1 \
        || die "docker compose could not start the engine's clickhouse service"
}

main() {
    mkdir -p "${LOG_DIR}"
    : >"${LOG}"
    RUN_DIR="$(mktemp -d "${TMPDIR:-/tmp}/dfe-smoke.XXXXXX")"
    trap cleanup EXIT
    trap 'exit 130' INT
    trap 'exit 143' TERM HUP

    check_prerequisites || exit 1
    record_versions

    run "console install (yarn install --immutable)" \
        in_dir "${UI_ROOT}" corepack yarn install --immutable || exit 1
    run "playwright browser (chromium)" \
        in_dir "${UI_ROOT}" corepack yarn workspace dfe-core-ui exec playwright install chromium || exit 1
    run "engine install (uv sync --frozen)" \
        in_dir "${ENGINE_DIR}" uv sync --frozen || exit 1

    write_engine_env
    if [[ "${CLICKHOUSE}" == "docker" ]]; then
        start_clickhouse
    fi

    rm -rf "${RESULTS_DIR}"
    export SMOKE_ENGINE_DIR="${ENGINE_DIR}"
    export SMOKE_ENGINE_ENV_FILE="${RUN_DIR}/engine.env"
    export SMOKE_ENGINE_WORKSPACE="${RUN_DIR}/engine-ws"
    export SMOKE_ENGINE_URL="${ENGINE_URL}"
    export SMOKE_UI_URL="${UI_URL}"
    export SMOKE_UI_PORT="${UI_PORT}"
    export SMOKE_RUN_SECRET="${RUN_SECRET}"
    if [[ "${CLICKHOUSE}" == "docker" ]]; then
        export SMOKE_ENGINE_WAIT_READY=yes
    fi
    export SMOKE_OUT_DIR="${RESULTS_DIR}"
    run "smoke: engine, console, login and 3 pages (headless, 1 worker)" \
        in_dir "${UI_ROOT}" corepack yarn workspace dfe-core-ui exec playwright test \
        --config smoke/playwright.config.ts --project=chromium --workers=1 || exit 1

    RESULT="PASS"
}

main "$@"
