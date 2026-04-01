import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import type { ChildProcess } from 'node:child_process';
import * as cp from 'node:child_process';
import { LanguageServerProcess, isSupportedLanguage } from './languageServerProcess.js';

const spawnMock = vi.fn();

vi.mock('node:child_process', async () => {
  const actual = await vi.importActual<typeof import('node:child_process')>('node:child_process');
  return { ...actual, spawn: (...a: Parameters<typeof cp.spawn>) => spawnMock(...a) };
});

function createMockChild(): ChildProcess {
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();
  const stdin = Object.assign(new EventEmitter(), {
    writable: true,
    write: vi.fn((_chunk: unknown, _enc?: unknown, cb?: () => void) => {
      if (typeof cb === 'function') cb();
      return true;
    }),
  }) as NodeJS.WritableStream & { writable: boolean };
  const proc = new EventEmitter() as unknown as ChildProcess;
  let killed = false;
  Object.assign(proc, {
    stdout,
    stderr,
    stdin,
    pid: 4242,
    get killed() {
      return killed;
    },
    set killed(v: boolean) {
      killed = v;
    },
  });
  proc.kill = vi.fn((signal?: NodeJS.Signals | number) => {
    killed = true;
    proc.emit('exit', 0, signal);
  }) as ChildProcess['kill'];
  return proc;
}

describe('isSupportedLanguage', () => {
  it('narrows rust and go', () => {
    expect(isSupportedLanguage('rust')).toBe(true);
    expect(isSupportedLanguage('go')).toBe(true);
    expect(isSupportedLanguage('python')).toBe(false);
  });
});

describe('LanguageServerProcess', () => {
  let child: ChildProcess;

  beforeEach(() => {
    child = createMockChild();
    spawnMock.mockReturnValue(child);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts rust-analyzer and forwards stdout messages', () => {
    const onMessage = vi.fn();
    const onClose = vi.fn();
    const lsp = new LanguageServerProcess('rust', '/tmp/ws', onMessage, onClose);
    lsp.start();

    expect(spawnMock).toHaveBeenCalledWith(
      'rust-analyzer',
      [],
      expect.objectContaining({ cwd: '/tmp/ws', stdio: ['pipe', 'pipe', 'pipe'] }),
    );

    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, result: {} });
    const frame = `Content-Length: ${Buffer.byteLength(body, 'utf-8')}\r\n\r\n${body}`;
    child.stdout!.emit('data', Buffer.from(frame, 'utf-8'));

    expect(onMessage).toHaveBeenCalledWith({ jsonrpc: '2.0', id: 1, result: {} });
  });

  it('starts gopls with serve', () => {
    const lsp = new LanguageServerProcess('go', '/g', vi.fn(), vi.fn());
    lsp.start();
    expect(spawnMock).toHaveBeenCalledWith('gopls', ['serve'], expect.any(Object));
  });

  it('logs stderr', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const lsp = new LanguageServerProcess('go', '/', vi.fn(), vi.fn());
    lsp.start();
    child.stderr!.emit('data', Buffer.from('warn line\n', 'utf-8'));
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('[go]'));
    errSpy.mockRestore();
  });

  it('invokes onClose on spawn error', () =>
    new Promise<void>((resolve) => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onClose = vi.fn();
      spawnMock.mockImplementation(() => {
        const p = createMockChild();
        setImmediate(() => p.emit('error', new Error('ENOENT')));
        return p;
      });
      const lsp = new LanguageServerProcess('rust', '/', vi.fn(), onClose);
      lsp.start();
      setImmediate(() => {
        expect(onClose).toHaveBeenCalled();
        errSpy.mockRestore();
        resolve();
      });
    }));

  it('invokes onClose on process exit', () => {
    const onClose = vi.fn();
    const lsp = new LanguageServerProcess('rust', '/', vi.fn(), onClose);
    lsp.start();
    child.emit('exit', 1, null);
    expect(onClose).toHaveBeenCalled();
  });

  it('send writes encoded message to stdin', () => {
    const lsp = new LanguageServerProcess('rust', '/', vi.fn(), vi.fn());
    lsp.start();
    lsp.send({ jsonrpc: '2.0', id: 1, method: 'shutdown' });
    const stdin = child.stdin as NodeJS.WritableStream & { write: ReturnType<typeof vi.fn> };
    expect(stdin.write).toHaveBeenCalled();
  });

  it('send is a no-op when stdin is not writable', () => {
    const lsp = new LanguageServerProcess('rust', '/', vi.fn(), vi.fn());
    lsp.start();
    Object.assign(child.stdin as object, { writable: false });
    lsp.send({ jsonrpc: '2.0', method: 'exit' });
  });

  it('kill sends SIGTERM when process exists', () => {
    const lsp = new LanguageServerProcess('rust', '/', vi.fn(), vi.fn());
    lsp.start();
    lsp.kill();
    expect(child.kill).toHaveBeenCalledWith('SIGTERM');
  });

  it('kill is safe when process is null', () => {
    const lsp = new LanguageServerProcess('rust', '/', vi.fn(), vi.fn());
    lsp.kill();
  });

  it('includes PATH segment when process.env.PATH is unset', () => {
    const prev = process.env.PATH;
    delete process.env.PATH;
    const lsp = new LanguageServerProcess('go', '/tmp', vi.fn(), vi.fn());
    lsp.start();
    expect(spawnMock).toHaveBeenCalledWith(
      'gopls',
      ['serve'],
      expect.objectContaining({
        env: expect.objectContaining({
          PATH: expect.stringMatching(/:/),
        }),
      }),
    );
    process.env.PATH = prev;
  });
});
