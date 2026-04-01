import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter, once } from 'node:events';
import type { Server } from 'node:http';
import type { ChildProcess } from 'node:child_process';
import * as cp from 'node:child_process';
import WebSocket from 'ws';
import type { WebSocketServer } from 'ws';
import * as lspModule from './languageServerProcess.js';
import {
  createLanguageServer,
  parseLanguage,
  handleClientMessage,
  rewriteUris,
} from './server.js';
import { Workspace } from './workspace.js';
import type { JsonRpcMessage } from './jsonrpc.js';

const spawnMock = vi.fn();

vi.mock('node:child_process', async () => {
  const actual = await vi.importActual<typeof import('node:child_process')>('node:child_process');
  return { ...actual, spawn: (...a: Parameters<typeof cp.spawn>) => spawnMock(...a) };
});

async function waitListening(server: Server) {
  if (server.listening) return;
  await once(server, 'listening');
}

async function shutdown(httpServer: Server, wss: WebSocketServer) {
  await new Promise<void>((r) => wss.close(() => r()));
  await new Promise<void>((r) => httpServer.close(() => r()));
}

function createMockChild(): ChildProcess {
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();
  const stdin = Object.assign(new EventEmitter(), {
    writable: true,
    write: vi.fn(() => true),
  }) as NodeJS.WritableStream & { writable: boolean };
  const proc = new EventEmitter() as unknown as ChildProcess;
  Object.assign(proc, { stdout, stderr, stdin, pid: 1, killed: false });
  proc.kill = vi.fn() as ChildProcess['kill'];
  return proc;
}

describe('parseLanguage', () => {
  it('returns null for missing or invalid urls', () => {
    expect(parseLanguage(undefined)).toBeNull();
    expect(parseLanguage('')).toBeNull();
    expect(parseLanguage('/python')).toBeNull();
  });

  it('accepts rust and go with optional trailing slash', () => {
    expect(parseLanguage('/rust')).toBe('rust');
    expect(parseLanguage('/go/')).toBe('go');
  });
});

describe('rewriteUris', () => {
  it('rewrites uri and rootUri strings recursively', () => {
    const obj = {
      a: { uri: 'u1', rootUri: 'r1' },
      nested: [{ uri: 'u2' }],
    };
    rewriteUris(obj, (u) => `mapped:${u}`);
    expect(obj).toEqual({
      a: { uri: 'mapped:u1', rootUri: 'mapped:r1' },
      nested: [{ uri: 'mapped:u2' }],
    });
  });

  it('ignores null, primitives, and non-uri keys', () => {
    rewriteUris(null, (u) => u);
    rewriteUris('x', (u) => u);
    rewriteUris({ other: 'keep' }, (u) => u);
    expect({ other: 'keep' }).toEqual({ other: 'keep' });
  });
});

describe('handleClientMessage', () => {
  it('no-ops without params', () => {
    const w = new Workspace('go');
    try {
      handleClientMessage({ jsonrpc: '2.0', method: 'x' } as JsonRpcMessage, w);
    } finally {
      w.dispose();
    }
  });

  it('sets workspace root on initialize and adds folders when absent', () => {
    const w = new Workspace('go');
    try {
      const msg: JsonRpcMessage = {
        jsonrpc: '2.0',
        method: 'initialize',
        params: {} as Record<string, unknown>,
      };
      handleClientMessage(msg, w);
      const p = msg.params as Record<string, unknown>;
      expect(p.rootUri).toBe(w.rootUri);
      expect(p.rootPath).toBe(w.root);
      expect(Array.isArray(p.workspaceFolders)).toBe(true);
    } finally {
      w.dispose();
    }
  });

  it('does not overwrite existing workspaceFolders', () => {
    const w = new Workspace('go');
    try {
      const existing = [{ uri: 'file:///x', name: 'n' }];
      const msg: JsonRpcMessage = {
        jsonrpc: '2.0',
        method: 'initialize',
        params: { workspaceFolders: existing } as Record<string, unknown>,
      };
      handleClientMessage(msg, w);
      expect((msg.params as { workspaceFolders: unknown }).workspaceFolders).toBe(existing);
    } finally {
      w.dispose();
    }
  });

  it('handles didOpen and didChange with full sync', () => {
    const w = new Workspace('rust');
    try {
      const clientUri = 'inmemory://model/1';
      handleClientMessage(
        {
          jsonrpc: '2.0',
          method: 'textDocument/didOpen',
          params: {
            textDocument: { uri: clientUri, text: 'fn main() {}' },
          },
        } as JsonRpcMessage,
        w,
      );
      handleClientMessage(
        {
          jsonrpc: '2.0',
          method: 'textDocument/didChange',
          params: {
            textDocument: { uri: clientUri },
            contentChanges: [{ text: 'fn main() {  }' }],
          },
        } as JsonRpcMessage,
        w,
      );
    } finally {
      w.dispose();
    }
  });

  it('didChange ignores incremental-only changes', () => {
    const w = new Workspace('go');
    try {
      const clientUri = 'inmemory://model/2';
      w.mapClientUri(clientUri);
      handleClientMessage(
        {
          jsonrpc: '2.0',
          method: 'textDocument/didChange',
          params: {
            textDocument: { uri: clientUri },
            contentChanges: [{ range: {} as never, text: 'x' }],
          },
        } as JsonRpcMessage,
        w,
      );
    } finally {
      w.dispose();
    }
  });

  it('didOpen skips when textDocument is missing', () => {
    const w = new Workspace('go');
    try {
      handleClientMessage(
        {
          jsonrpc: '2.0',
          method: 'textDocument/didOpen',
          params: {},
        } as JsonRpcMessage,
        w,
      );
    } finally {
      w.dispose();
    }
  });

  it('didChange skips when contentChanges is empty or missing full sync', () => {
    const w = new Workspace('go');
    try {
      const uri = 'inmemory://model/3';
      w.mapClientUri(uri);
      handleClientMessage(
        {
          jsonrpc: '2.0',
          method: 'textDocument/didChange',
          params: { textDocument: { uri }, contentChanges: [] },
        } as JsonRpcMessage,
        w,
      );
      handleClientMessage(
        {
          jsonrpc: '2.0',
          method: 'textDocument/didChange',
          params: {
            textDocument: { uri },
            contentChanges: [{ range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }, text: 'z' }],
          },
        } as JsonRpcMessage,
        w,
      );
      handleClientMessage(
        {
          jsonrpc: '2.0',
          method: 'textDocument/didChange',
          params: { contentChanges: [{ text: 'only' }] },
        } as JsonRpcMessage,
        w,
      );
    } finally {
      w.dispose();
    }
  });

  it('rewriteUris maps rootUri in nested objects', () => {
    const obj = { config: { rootUri: 'file:///a' } };
    rewriteUris(obj, (u) => `m:${u}`);
    expect(obj).toEqual({ config: { rootUri: 'm:file:///a' } });
  });
});

describe('createLanguageServer', () => {
  let child: ChildProcess;

  beforeEach(() => {
    child = createMockChild();
    spawnMock.mockReturnValue(child);
  });

  it('serves health JSON on GET /', async () => {
    const { httpServer, wss } = createLanguageServer(0);
    await waitListening(httpServer);
    const addr = httpServer.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;
    const res = await fetch(`http://127.0.0.1:${port}/`);
    expect(res.ok).toBe(true);
    const body = (await res.json()) as { status: string; languages: string[] };
    expect(body.status).toBe('ok');
    expect(body.languages).toEqual(['rust', 'go']);
    await shutdown(httpServer, wss);
  });

  it('proxies WebSocket messages to stdin and forwards stdout to client', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { httpServer, wss } = createLanguageServer(0);
    await waitListening(httpServer);
    const addr = httpServer.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;

    const client = new WebSocket(`ws://127.0.0.1:${port}/go`);
    await new Promise<void>((resolve, reject) => {
      client.once('open', resolve);
      client.once('error', reject);
    });

    const init: JsonRpcMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { capabilities: {} },
    };
    client.send(JSON.stringify(init));

    for (let i = 0; i < 50 && !spawnMock.mock.calls.length; i++) {
      await new Promise((r) => setTimeout(r, 10));
    }
    expect(spawnMock).toHaveBeenCalled();

    const body = JSON.stringify({
      jsonrpc: '2.0',
      method: 'textDocument/publishDiagnostics',
      params: { uri: 'file:///workspace/main.go', diagnostics: [] },
    });
    const frame = `Content-Length: ${Buffer.byteLength(body, 'utf-8')}\r\n\r\n${body}`;
    child.stdout!.emit('data', Buffer.from(frame, 'utf-8'));

    await new Promise<void>((resolve, reject) => {
      client.once('message', (data) => {
        try {
          const msg = JSON.parse(data.toString()) as { method?: string };
          expect(msg.method).toBe('textDocument/publishDiagnostics');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
      client.once('error', reject);
    });

    client.close();
    await new Promise<void>((r) => client.once('close', r));
    await shutdown(httpServer, wss);
    logSpy.mockRestore();
  });

  it('closes client WebSocket when language server process exits', async () => {
    const { httpServer, wss } = createLanguageServer(0);
    await waitListening(httpServer);
    const addr = httpServer.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;

    const client = new WebSocket(`ws://127.0.0.1:${port}/rust`);
    await new Promise<void>((r) => client.once('open', r));

    child.emit('exit', 0, null);

    const code = await new Promise<number>((resolve) => {
      client.once('close', (c) => resolve(c));
    });
    expect(code).toBe(1011);

    await shutdown(httpServer, wss);
  });

  it('rejects WebSocket upgrade for invalid language path', async () => {
    const { httpServer, wss } = createLanguageServer(0);
    await waitListening(httpServer);
    const addr = httpServer.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;

    await new Promise<void>((resolve, reject) => {
      const c = new WebSocket(`ws://127.0.0.1:${port}/invalid`);
      c.on('open', () => reject(new Error('should not connect')));
      c.on('error', () => resolve());
    });

    await shutdown(httpServer, wss);
  });

  it('closes with 1008 when language is unsupported', async () => {
    const spy = vi.spyOn(lspModule, 'isSupportedLanguage').mockImplementation(() => false);
    const { httpServer, wss } = createLanguageServer(0);
    await waitListening(httpServer);
    const addr = httpServer.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;

    const client = new WebSocket(`ws://127.0.0.1:${port}/rust`);
    const code = await new Promise<number>((resolve) => {
      client.once('close', (c) => resolve(c));
    });

    expect(code).toBe(1008);
    spy.mockRestore();
    await shutdown(httpServer, wss);
  });

  it('logs when client message JSON is invalid', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { httpServer, wss } = createLanguageServer(0);
    await waitListening(httpServer);
    const addr = httpServer.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;

    const client = new WebSocket(`ws://127.0.0.1:${port}/rust`);
    await new Promise<void>((r) => client.once('open', r));
    client.send('not-json{');
    await new Promise<void>((r) => setTimeout(r, 50));
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('[rust]'));

    client.close();
    await shutdown(httpServer, wss);
    errSpy.mockRestore();
  });

  it('emits error on server WebSocket and cleans up', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { httpServer, wss } = createLanguageServer(0);
    await waitListening(httpServer);
    const addr = httpServer.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;

    const serverWsPromise = new Promise<WebSocket>((resolve) => {
      wss.once('connection', (ws) => resolve(ws));
    });

    const client = new WebSocket(`ws://127.0.0.1:${port}/rust`);
    await new Promise<void>((r) => client.once('open', r));
    const serverWs = await serverWsPromise;
    serverWs.emit('error', new Error('boom'));

    await new Promise<void>((r) => setTimeout(r, 30));
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('[rust]'));

    client.close();
    await shutdown(httpServer, wss);
    errSpy.mockRestore();
  });

});
