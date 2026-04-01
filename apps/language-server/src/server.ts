import { createServer, type IncomingMessage } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import {
  LanguageServerProcess,
  isSupportedLanguage,
} from './languageServerProcess.js';
import type { JsonRpcMessage } from './jsonrpc.js';
import { Workspace } from './workspace.js';
import { closeIfOpen, sendJsonIfOpen } from './wsHelpers.js';

export function createLanguageServer(port: number) {
  const httpServer = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', languages: ['rust', 'go'] }));
  });

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req: IncomingMessage, socket, head) => {
    const language = parseLanguage(req.url);
    if (!language) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req, language);
    });
  });

  wss.on('connection', (ws: WebSocket, _req: IncomingMessage, language: string) => {
    if (!isSupportedLanguage(language)) {
      ws.close(1008, `Unsupported language: ${language}`);
      return;
    }

    console.log(`[${language}] Client connected`);

    const workspace = new Workspace(language);
    console.log(`[${language}] Workspace created at ${workspace.root}`);

    const lsp = new LanguageServerProcess(
      language,
      workspace.root,
      (msg: JsonRpcMessage) => {
        rewriteUris(msg, (uri) => workspace.mapFileUri(uri));
        sendJsonIfOpen(ws, JSON.stringify(msg));
      },
      () => {
        closeIfOpen(ws, 1011, 'Language server process exited');
      },
    );

    lsp.start();

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as JsonRpcMessage;
        handleClientMessage(message, workspace);
        rewriteUris(message, (uri) => workspace.mapClientUri(uri));
        lsp.send(message);
      } catch {
        console.error(`[${language}] Failed to parse client message`);
      }
    });

    ws.on('close', () => {
      console.log(`[${language}] Client disconnected`);
      lsp.kill();
      workspace.dispose();
    });

    ws.on('error', (err) => {
      console.error(`[${language}] WebSocket error: ${err.message}`);
      lsp.kill();
      workspace.dispose();
    });
  });

  httpServer.listen(port, () => {
    console.log(`Language server listening on http://localhost:${port}`);
    console.log(`  WebSocket endpoints:`);
    console.log(`    ws://localhost:${port}/rust  → rust-analyzer`);
    console.log(`    ws://localhost:${port}/go    → gopls`);
  });

  return { httpServer, wss };
}

/**
 * Intercepts didOpen/didChange to write file content to the workspace,
 * and rewrites the initialize rootUri to the workspace root.
 * Exported for unit tests.
 */
export function handleClientMessage(message: JsonRpcMessage, workspace: Workspace): void {
  const params = message.params as Record<string, unknown> | undefined;
  if (!params) return;

  if (message.method === 'initialize') {
    params.rootUri = workspace.rootUri;
    params.rootPath = workspace.root;
    if (!params.workspaceFolders) {
      params.workspaceFolders = [{ uri: workspace.rootUri, name: 'workspace' }];
    }
  }

  if (message.method === 'textDocument/didOpen') {
    const textDoc = params.textDocument as { uri: string; text: string } | undefined;
    if (textDoc) {
      workspace.mapClientUri(textDoc.uri);
      workspace.writeFile(textDoc.uri, textDoc.text);
    }
  }

  if (message.method === 'textDocument/didChange') {
    const contentChanges = params.contentChanges as { text: string }[] | undefined;
    const textDoc = params.textDocument as { uri: string } | undefined;
    if (textDoc && contentChanges?.length) {
      const fullText = contentChanges.find((c) => !('range' in c));
      if (fullText) {
        workspace.writeFile(textDoc.uri, fullText.text);
      }
    }
  }
}

/**
 * Recursively walks a JSON-RPC message and rewrites any `uri` string
 * fields using the provided mapping function.
 * Exported for unit tests.
 */
export function rewriteUris(obj: unknown, mapUri: (uri: string) => string): void {
  if (obj == null || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) rewriteUris(item, mapUri);
    return;
  }

  const record = obj as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (key === 'uri' && typeof record[key] === 'string') {
      record[key] = mapUri(record[key]);
    } else if (key === 'rootUri' && typeof record[key] === 'string') {
      record[key] = mapUri(record[key]);
    } else if (typeof record[key] === 'object') {
      rewriteUris(record[key], mapUri);
    }
  }
}

/** Exported for unit tests. */
export function parseLanguage(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/^\/(rust|go)\/?$/);
  return match?.[1] ?? null;
}
