#!/usr/bin/env python3
"""Run dfe-engine and the console natively and prove them with a Playwright smoke.

Usage:
    uv run --no-project python scripts/macos-dev-smoke.py
    python3 scripts/macos-dev-smoke.py        # a stock Mac's python3 works too

It checks the prerequisites and names what is missing with the install line,
installs the console and engine dependencies, starts a local ClickHouse when
docker answers, runs the Playwright smoke (which starts and stops the engine
and the console), tears everything down, and ends in one PASS or FAIL line with
the path to one log file. The macOS CI job runs this same file.

Standard library only, and no syntax newer than Python 3.9, because that is
what a Mac has before anything is installed.

Settings (environment):
    DFE_ENGINE_DIR       dfe-engine checkout (default: ../dfe-engine beside this repo)
    ENGINE_PORT          default 8003
    UI_PORT              default 3000 (the engine's CORS list allows 3000, 5173, 5174)
    ENGINE_METRICS_PORT  the engine's /livez listener, default 19090 (not 9090)
    CLICKHOUSE_HTTP_PORT host port for the local ClickHouse, default 18123
    CLICKHOUSE           auto | docker | none (default auto: docker when a daemon answers)
    SMOKE_LOG            the one log file (default .macos-smoke/smoke.log in this repo)
"""

# The future import is for Python 3.9: PEP 604 unions in annotations fail there.
from __future__ import annotations

import os
import re
import secrets
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path

UI_ROOT = Path(__file__).resolve().parent.parent
TEXT = {"encoding": "utf-8", "errors": "replace"}
SECRET_WORDS = ("SECRET", "PASSWORD", "TOKEN", "KEY")
PLAYWRIGHT_TEST = [
    "corepack",
    "yarn",
    "workspace",
    "dfe-core-ui",
    "exec",
    "playwright",
    "test",
    "--config",
    "smoke/playwright.config.ts",
    "--project=chromium",
    "--workers=1",
]
NODE_HINT = (
    "brew install node@24 && brew link --overwrite node@24   (or fnm / nvm install 24)"
)


class Smoke:
    """One run: its settings, its log, and what has to be undone at the end."""

    def __init__(self) -> None:
        env = os.environ
        default_engine = UI_ROOT.parent / "dfe-engine"
        self.engine_dir = Path(env.get("DFE_ENGINE_DIR") or default_engine)
        self.engine_port = int(env.get("ENGINE_PORT", "8003"))
        self.ui_port = int(env.get("UI_PORT", "3000"))
        self.metrics_port = int(env.get("ENGINE_METRICS_PORT", "19090"))
        self.ch_port = int(env.get("CLICKHOUSE_HTTP_PORT", "18123"))
        self.clickhouse = env.get("CLICKHOUSE", "auto")
        default_log = UI_ROOT / ".macos-smoke" / "smoke.log"
        self.log_path = Path(env.get("SMOKE_LOG") or default_log)
        self.results_dir = self.log_path.parent / "results"
        self.engine_url = f"http://127.0.0.1:{self.engine_port}"
        self.ui_url = f"http://localhost:{self.ui_port}"
        # Throwaway for this run: the engine wants a signing secret of 32 bytes or more.
        self.run_secret = f"smoke-{secrets.token_hex(24)}"
        self.run_dir = Path(tempfile.mkdtemp(prefix="dfe-smoke-"))
        self.env_file = self.run_dir / "engine.env"
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self.log_file = open(self.log_path, "w", encoding="utf-8", buffering=1)
        self.step_name = "start"
        self.ch_project = ""
        self.legacy_env = False
        self.env_backup: Path | None = None

    # -- output ---------------------------------------------------------

    def log(self, message: str) -> None:
        print(message, flush=True)
        self.log_file.write(message + "\n")

    def quiet(self, message: str) -> None:
        self.log_file.write(message + "\n")

    def section(self, name: str) -> None:
        self.step_name = name
        self.log_file.write(f"\n===== {name} =====\n")
        print(f"==> {name}", flush=True)

    def tail(self, lines: int = 15) -> str:
        self.log_file.flush()
        text = self.log_path.read_text(**TEXT)
        return "\n".join("    " + line for line in text.splitlines()[-lines:])

    # -- running things -------------------------------------------------

    @staticmethod
    def capture(cmd: list[str], cwd: Path | None = None) -> str:
        """Return the first output line of a command, or why it gave none."""
        try:
            done = subprocess.run(  # noqa: S603
                cmd, cwd=cwd, capture_output=True, timeout=60, check=False, **TEXT
            )
        except (OSError, subprocess.TimeoutExpired) as error:
            return f"unavailable ({error})"
        lines = (done.stdout + done.stderr).strip().splitlines()
        return lines[0] if lines else f"no output (exit {done.returncode})"

    def run_group(self, cmd: list[str], cwd: Path, env: dict[str, str]) -> int:
        """Run a command in its own process group with its output in the log.

        An interrupt or SIGTERM stops the whole group before it propagates, so
        Playwright gets to stop the servers it started.
        """
        self.log_file.flush()
        proc = subprocess.Popen(  # noqa: S603
            cmd,
            cwd=cwd,
            env=env,
            stdout=self.log_file,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )
        try:
            return proc.wait()
        except BaseException:
            self.stop_group(proc)
            raise

    @staticmethod
    def stop_group(proc: subprocess.Popen) -> None:
        for sig, patience in (
            (signal.SIGINT, 30),
            (signal.SIGTERM, 10),
            (signal.SIGKILL, 5),
        ):
            try:
                os.killpg(proc.pid, sig)
            except ProcessLookupError:
                return
            try:
                proc.wait(timeout=patience)
                return
            except subprocess.TimeoutExpired:
                continue

    def step(
        self,
        label: str,
        cmd: list[str],
        cwd: Path,
        extra_env: dict[str, str] | None = None,
    ) -> bool:
        """Run one step. On failure show the tail of the log and return False."""
        self.section(label)
        env = {**os.environ, **(extra_env or {})}
        status = self.run_group(cmd, cwd, env)
        if status == 0:
            return True
        print(f'step "{label}" failed (exit {status}), last lines:')
        print(self.tail())
        return False

    # -- checks ---------------------------------------------------------

    @staticmethod
    def port_holder(port: int) -> str:
        """Name what listens on a local port, or return '' when it is free."""
        listening = False
        for family, host in ((socket.AF_INET, "127.0.0.1"), (socket.AF_INET6, "::1")):
            try:
                with socket.socket(family, socket.SOCK_STREAM) as probe:
                    probe.settimeout(1)
                    listening = listening or probe.connect_ex((host, port)) == 0
            except OSError:
                continue
        if not listening:
            return ""
        if shutil.which("lsof"):
            holder = subprocess.run(  # noqa: S603
                ["lsof", "-nP", f"-iTCP:{port}", "-sTCP:LISTEN"],  # noqa: S607
                capture_output=True,
                check=False,
                **TEXT,
            ).stdout.splitlines()
            if len(holder) > 1:
                return holder[1]
        return "something (install lsof to see what)"

    @staticmethod
    def docker_ready() -> bool:
        if shutil.which("docker") is None:
            return False
        try:
            done = subprocess.run(
                ["docker", "info"],  # noqa: S607
                capture_output=True,
                timeout=20,
                check=False,
            )
        except OSError, subprocess.TimeoutExpired:
            return False
        return done.returncode == 0

    def missing_tools(self) -> list[tuple[str, str]]:
        """Return each missing prerequisite with the line that installs it."""
        missing: list[tuple[str, str]] = []
        for tool in ("git", "make"):
            if shutil.which(tool) is None:
                missing.append((tool, "xcode-select --install"))
        if shutil.which("curl") is None:
            missing.append(("curl", "it ships with macOS, check your PATH"))
        if shutil.which("uv") is None:
            missing.append(
                (
                    "uv",
                    "brew install uv   "
                    "(or https://docs.astral.sh/uv/getting-started/installation/)",
                )
            )
        if shutil.which("node") is None:
            missing.append(("node 24 or newer", NODE_HINT))
        else:
            version = self.capture(["node", "-v"])
            major = re.match(r"v(\d+)", version)
            if major is None or int(major.group(1)) < 24:
                missing.append((f"node 24 or newer (found {version})", NODE_HINT))
            if shutil.which("corepack") is None:
                missing.append(
                    ("corepack (yarn 4 comes through it)", "npm install -g corepack")
                )
        makefile = self.engine_dir / "Makefile"
        has_target = makefile.is_file() and re.search(
            r"^e2e-server:", makefile.read_text(**TEXT), re.MULTILINE
        )
        if not has_target:
            missing.append(
                (
                    f"a dfe-engine checkout at {self.engine_dir}",
                    "git clone https://github.com/hyperi-io/dfe-engine.git "
                    f"{self.engine_dir}   (or set DFE_ENGINE_DIR)",
                )
            )
        return missing

    def check_prerequisites(self) -> bool:
        self.section("prerequisites")
        missing = self.missing_tools()
        if self.clickhouse == "auto":
            self.clickhouse = "docker" if self.docker_ready() else "none"
        elif self.clickhouse == "docker":
            if not self.docker_ready():
                missing.append(
                    (
                        "a running docker daemon (CLICKHOUSE=docker)",
                        "brew install --cask orbstack   (open it once), "
                        "or set CLICKHOUSE=none",
                    )
                )
        elif self.clickhouse != "none":
            self.log(
                f"CLICKHOUSE must be auto, docker or none, not '{self.clickhouse}'"
            )
            return False

        if missing:
            lines = [f"  - {need}\n      {hint}" for need, hint in missing]
            self.log("Missing prerequisites:\n" + "\n".join(lines))
            return False

        compose = self.engine_dir / "docker-compose.dev.yaml"
        if self.clickhouse == "docker" and not (
            compose.is_file()
            and re.search(r"^  clickhouse:", compose.read_text(**TEXT), re.MULTILINE)
        ):
            self.log(
                "this dfe-engine has no clickhouse service in docker-compose.dev.yaml: "
                "running with no ClickHouse"
            )
            self.clickhouse = "none"

        ports = [self.engine_port, self.ui_port, self.metrics_port]
        if self.clickhouse == "docker":
            ports.append(self.ch_port)
        busy = [(port, self.port_holder(port)) for port in ports]
        busy = [(port, holder) for port, holder in busy if holder]
        if busy:
            lines = [f"  - port {port} is in use: {holder}" for port, holder in busy]
            self.log(
                "A port is taken (stop it, or set ENGINE_PORT / UI_PORT / "
                "ENGINE_METRICS_PORT):\n" + "\n".join(lines)
            )
            return False
        self.log(f"prerequisites ok (clickhouse: {self.clickhouse})")
        return True

    def describe(self, repo: Path) -> str:
        sha = self.capture(["git", "-C", str(repo), "rev-parse", "--short=12", "HEAD"])
        tag = self.capture(["git", "-C", str(repo), "describe", "--tags", "--always"])
        return f"{sha} {tag}"

    def record_versions(self) -> None:
        self.section("versions")
        uname = os.uname()
        docker = "not available"
        if self.docker_ready():
            docker = self.capture(
                ["docker", "version", "--format", "{{.Server.Version}}"]
            )
        rows = [
            ("date", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
            ("system", f"{uname.sysname} {uname.release} {uname.machine}"),
            ("python", sys.version.split()[0]),
            ("uv", self.capture(["uv", "--version"])),
            ("node", self.capture(["node", "-v"])),
            ("yarn", self.capture(["corepack", "yarn", "--version"], UI_ROOT)),
            ("make", self.capture(["make", "--version"])),
            ("curl", self.capture(["curl", "--version"])),
            ("docker", docker),
            ("dfe-ui", self.describe(UI_ROOT)),
            ("dfe-engine", self.describe(self.engine_dir)),
            ("clickhouse", self.clickhouse),
        ]
        if shutil.which("sw_vers"):
            rows.insert(2, ("macOS", self.capture(["sw_vers", "-productVersion"])))
        for name, value in rows:
            self.quiet(f"{name + ':':<12}{value}")

    # -- setup and teardown -----------------------------------------------

    def write_engine_env(self) -> None:
        values = {
            "DFE_ENGINE_ENV": "test",
            "DFE_ENGINE_API_HOST": "127.0.0.1",
            "DFE_ENGINE_API_PORT": str(self.engine_port),
            "DFE_ENGINE_API_JWT_SECRET": self.run_secret,
            "DFE_ENGINE_API_CORS_ORIGINS": (
                f"http://localhost:{self.ui_port},http://127.0.0.1:{self.ui_port}"
            ),
            "DFE_ENGINE_AUTH_ENABLED": "true",
            "DFE_ENGINE_GITOPS_ENABLED": "false",
            "DFE_ENGINE_TRANSPORT_BUS_PRESENT": "false",
            "DFE_ENGINE_TRANSPORT_DEFAULT": "direct",
            "DFE_ENGINE_CLICKHOUSE_HOST": "127.0.0.1",
            "DFE_ENGINE_CLICKHOUSE_PORT": str(self.ch_port),
            "DFE_ENGINE_CLICKHOUSE_USERNAME": "default",
            "DFE_ENGINE_CLICKHOUSE_SECURE": "false",
            "DFE_ENGINE_CLICKHOUSE_VERIFY": "false",
        }
        if self.clickhouse == "docker":
            values["DFE_ENGINE_CLICKHOUSE_PASSWORD"] = f"ch-{self.run_secret}"
            values["DFE_ENGINE_CLICKHOUSE_BOOTSTRAP_TABLES"] = "true"
        else:
            values["DFE_ENGINE_CLICKHOUSE_PASSWORD"] = ""
            values["DFE_ENGINE_CLICKHOUSE_BOOTSTRAP_TABLES"] = "false"
            values["DFE_ENGINE_TENANT_ISOLATION_ENABLED"] = "false"
        values["OTEL_EXPORTER_OTLP_ENDPOINT"] = '" "'
        values["METRICS_ADDR"] = f"127.0.0.1:{self.metrics_port}"

        lines = [f"{name}={value}" for name, value in values.items()]
        self.env_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
        self.section("engine env")
        for name, value in values.items():
            hidden = any(word in name for word in SECRET_WORDS)
            self.quiet(f"{name}={'<set>' if hidden else value}")

        # A dfe-engine whose Makefile predates E2E_ENV_FILE reads ./.env.e2e, so the
        # file goes there for the run. A developer's own copy is put back afterwards.
        makefile = (self.engine_dir / "Makefile").read_text(**TEXT)
        if re.search(r"^E2E_ENV_FILE", makefile, re.MULTILINE) is None:
            self.legacy_env = True
            target = self.engine_dir / ".env.e2e"
            if target.exists():
                self.env_backup = self.run_dir / "env.e2e.backup"
                shutil.move(str(target), str(self.env_backup))
            shutil.copyfile(self.env_file, target)
            self.quiet(f"engine Makefile has no E2E_ENV_FILE: env placed at {target}")

    def compose_cmd(self, *args: str) -> list[str]:
        compose_file = self.engine_dir / "docker-compose.dev.yaml"
        return [
            "docker",
            "compose",
            "-p",
            self.ch_project,
            "-f",
            str(compose_file),
            *args,
        ]

    def start_clickhouse(self) -> bool:
        """Start the engine's own compose service, which carries the Keeper config."""
        self.ch_project = f"dfe-smoke-{os.getpid()}"
        env = {
            "DFE_ENGINE_CLICKHOUSE_PORT": str(self.ch_port),
            "DFE_ENGINE_CLICKHOUSE_PASSWORD": f"ch-{self.run_secret}",
        }
        label = "clickhouse (engine docker-compose.dev.yaml)"
        cmd = self.compose_cmd("up", "-d", "--wait", "clickhouse")
        if self.step(label, cmd, self.engine_dir, env):
            return True
        self.log("docker compose could not start the engine's clickhouse service")
        return False

    def run_smoke(self) -> bool:
        shutil.rmtree(self.results_dir, ignore_errors=True)
        extra = {
            "SMOKE_ENGINE_DIR": str(self.engine_dir),
            "SMOKE_ENGINE_ENV_FILE": str(self.env_file),
            "SMOKE_ENGINE_WORKSPACE": str(self.run_dir / "engine-ws"),
            "SMOKE_ENGINE_URL": self.engine_url,
            "SMOKE_UI_URL": self.ui_url,
            "SMOKE_UI_PORT": str(self.ui_port),
            "SMOKE_RUN_SECRET": self.run_secret,
            "SMOKE_OUT_DIR": str(self.results_dir),
        }
        if self.clickhouse == "docker":
            extra["SMOKE_ENGINE_WAIT_READY"] = "yes"
        label = "smoke: engine, console, login and 3 pages (headless, 1 worker)"
        return self.step(label, PLAYWRIGHT_TEST, UI_ROOT, extra)

    def cleanup(self) -> None:
        if self.ch_project:
            subprocess.run(  # noqa: S603
                self.compose_cmd("down", "-v"),
                cwd=self.engine_dir,
                env={**os.environ, "DFE_ENGINE_CLICKHOUSE_PORT": str(self.ch_port)},
                stdout=self.log_file,
                stderr=subprocess.STDOUT,
                check=False,
            )
        # Playwright stopped the servers when its run ended. Say so if a port answers.
        ports = (self.engine_port, self.ui_port, self.metrics_port)
        leftover = [str(port) for port in ports if self.port_holder(port)]
        if leftover:
            self.quiet("WARNING: still listening after teardown: " + " ".join(leftover))
        if self.legacy_env:
            (self.engine_dir / ".env.e2e").unlink(missing_ok=True)
            if self.env_backup is not None:
                shutil.move(str(self.env_backup), str(self.engine_dir / ".env.e2e"))
        shutil.rmtree(self.run_dir, ignore_errors=True)
        self.log_file.flush()

    def run(self) -> bool:
        """Run every step in order and stop at the first that fails."""
        if not self.check_prerequisites():
            return False
        self.record_versions()
        steps = [
            (
                "console install (yarn install --immutable)",
                ["corepack", "yarn", "install", "--immutable"],
                UI_ROOT,
            ),
            (
                "playwright browser (chromium)",
                ["corepack", "yarn", "workspace", "dfe-core-ui"]
                + ["exec", "playwright", "install", "chromium"],
                UI_ROOT,
            ),
            (
                "engine install (uv sync --frozen)",
                ["uv", "sync", "--frozen"],
                self.engine_dir,
            ),
        ]
        for label, cmd, cwd in steps:
            if not self.step(label, cmd, cwd):
                return False
        self.write_engine_env()
        if self.clickhouse == "docker" and not self.start_clickhouse():
            return False
        return self.run_smoke()


def _stop_on_signal(signum: int, _frame: object) -> None:
    raise SystemExit(128 + signum)


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if callable(reconfigure):
            reconfigure(encoding="utf-8", errors="replace")
    signal.signal(signal.SIGTERM, _stop_on_signal)
    signal.signal(signal.SIGHUP, _stop_on_signal)

    smoke = Smoke()
    passed = False
    try:
        passed = smoke.run()
    except KeyboardInterrupt, SystemExit:
        smoke.quiet(f"interrupted during: {smoke.step_name}")
    finally:
        # A second Ctrl-C while the teardown runs must not skip the rest of it.
        previous = signal.signal(signal.SIGINT, signal.SIG_IGN)
        smoke.cleanup()
        signal.signal(signal.SIGINT, previous)
    if passed:
        print(f"PASS  log: {smoke.log_path}")
        return 0
    print(f"FAIL (step: {smoke.step_name})  log: {smoke.log_path}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
