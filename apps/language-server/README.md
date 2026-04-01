# Language Server

WebSocket proxy that bridges Monaco Editor to native language servers (`rust-analyzer` for Rust, `gopls` for Go) via the Language Server Protocol.

```
Monaco Editor  ←WebSocket/JSON-RPC→  language-server  ←stdio/JSON-RPC→  rust-analyzer / gopls
```

Each client connection gets an isolated temporary workspace with the appropriate project scaffolding (`go.mod` or `Cargo.toml`), so language servers can analyze standalone code snippets as if they were part of a real project.

## Prerequisites

### Go

```bash
# Install Go (macOS)
brew install go

# Install gopls
go install golang.org/x/tools/gopls@latest
```

Ensure `~/go/bin` is on your `PATH`. The server automatically adds this directory when spawning `gopls`, but having it on your shell `PATH` makes it easier to verify the install:

```bash
gopls version
```

### Rust

```bash
# Install rust-analyzer (macOS, standalone)
brew install rust-analyzer

# Or via rustup (if using the full Rust toolchain)
rustup component add rust-analyzer
```

If installed via `rustup`, ensure `~/.cargo/bin` is on your `PATH`. The server automatically includes this directory as well.

## Tests

```bash
yarn workspace language-server test
yarn workspace language-server test:coverage
```

Coverage thresholds are set to 100% for statements, branches, functions, and lines.

## Development

The language server runs as part of the Turborepo `dev` pipeline. From the repo root:

```bash
yarn dev
```

This starts both `dfe-core-ui` (port 3000) and the language server (port 3001). The language server uses `tsx watch` for hot-reloading on file changes.

To run the language server in isolation:

```bash
yarn workspace language-server dev
```

### Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port for the WebSocket server |
| `NEXT_PUBLIC_LANGUAGE_SERVER_URL` | `ws://localhost:3001` | Client-side WebSocket URL (set in `dfe-core-ui`) |

### WebSocket Endpoints

| Path | Language Server |
|---|---|
| `ws://localhost:3001/rust` | `rust-analyzer` |
| `ws://localhost:3001/go` | `gopls` |

A `GET /` request returns a JSON health check:

```json
{ "status": "ok", "languages": ["rust", "go"] }
```

## Adding a new language

The proxy is wired per language in a few places. Use the existing Rust and Go entries as templates.

### 1. Spawn the native language server (`src/languageServerProcess.ts`)

- Extend `SupportedLanguage` with the new id (e.g. `'python'`).
- Add an entry to `LANGUAGE_SERVER_CONFIG` with the `command` and `args` used to start the language server over stdio (LSP). Most tools document this in their README (e.g. `pylsp`, `pyright-langserver`, `clangd`).

### 2. Workspace scaffolding (`src/workspace.ts`)

Language servers usually expect a real project root and at least one file on disk.

- Add entries to `SCAFFOLDING` for the new id: `files` (relative paths and initial contents, e.g. `package.json`, `pyproject.toml`), and `entryDir` (`.` or a subfolder like `src`).
- Add an entry to `DEFAULT_FILENAME` for the main file the editor syncs (`main.rs`, `main.go`, etc.).

If the server needs extra directories on `PATH`, extend `buildPath()` in `languageServerProcess.ts` with another common install location.

### 3. WebSocket route (`src/server.ts`)

- Include the new id in the `parseLanguage` regex in `parseLanguage()` so `ws://host:PORT/<id>` is accepted.
- Update the `languages` array in the JSON returned by the health `GET /` handler so operators and docs stay accurate.

### 4. Monaco client (`apps/dfe-core-ui`)

- In `src/core/components/Editor/MonacoEditor/lsp/useLanguageServer.ts`, add the new id to `LSP_LANGUAGES` and to the `SupportedLspLanguage` type.
- Wire the UI to pass Monaco’s `language` prop that matches that id (e.g. `python` for `monaco-editor`’s Python mode). The transform editor or any screen that uses `useLanguageServer` must use the same string as the WebSocket path segment.

### 5. Optional: README and docs

- Add a **Prerequisites** subsection for installing the new language server binary.
- Mention any new temp directory prefix in **Temp directory cleanup** (e.g. `lsp-python-*`).

After changes, restart `yarn dev` (or the language-server workspace only) and verify `ws://localhost:3001/<id>` connects and diagnostics appear in the editor.

## Production

### Build

```bash
yarn workspace language-server build
```

This compiles TypeScript to `dist/` via `tsc`.

### Run

```bash
PORT=3001 node dist/index.js
```

### Production Requirements

- Node.js >= 18
- `gopls` and/or `rust-analyzer` must be installed and accessible on the server's `PATH` (or in `~/go/bin` / `~/.cargo/bin`)
- The server creates temporary directories under the system's `tmpdir` for workspace scaffolding — ensure the process has write access to the temp directory and adequate disk space

### Deployment Considerations

- **Process management**: Use a process manager (e.g., `pm2`, systemd) to keep the server running and handle restarts.
- **Reverse proxy**: Place behind a reverse proxy (e.g., nginx, Caddy) that supports WebSocket upgrades. Example nginx config:
  ```nginx
  location /lsp/ {
      proxy_pass http://127.0.0.1:3001/;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
  }
  ```
- **Client URL**: Set `NEXT_PUBLIC_LANGUAGE_SERVER_URL` to the public WebSocket URL (e.g., `wss://your-domain.com/lsp`) when building `dfe-core-ui`.
- **Temp directory cleanup**: Workspaces are cleaned up on client disconnect, but orphaned directories may remain after unexpected crashes. Consider a periodic cleanup of `lsp-rust-*` and `lsp-go-*` directories in the system temp folder.
- **Resource limits**: Each WebSocket connection spawns one language server process. For multi-user deployments, monitor memory and CPU usage — `rust-analyzer` in particular can be memory-intensive.
