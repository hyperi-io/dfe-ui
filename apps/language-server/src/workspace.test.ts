import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fs from 'node:fs';
import { Workspace } from './workspace.js';

const rmCtx = vi.hoisted(() => ({
  real: null as null | ((...args: Parameters<typeof import('node:fs').rmSync>) => void),
}));

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  rmCtx.real = actual.rmSync.bind(actual);
  return {
    ...actual,
    rmSync: vi.fn((...args: Parameters<typeof actual.rmSync>) => rmCtx.real!(...args)),
  };
});

describe('Workspace', () => {
  const created: Workspace[] = [];

  afterEach(() => {
    for (const w of created) {
      try {
        w.dispose();
      } catch {
        /* ignore */
      }
    }
    created.length = 0;
    vi.mocked(fs.rmSync).mockImplementation((...args: Parameters<typeof fs.rmSync>) =>
      rmCtx.real!(...args),
    );
  });

  it('creates temp root and scaffolding for go', () => {
    const w = new Workspace('go');
    created.push(w);
    expect(w.root).toContain('lsp-go-');
    expect(fs.existsSync(`${w.root}/go.mod`)).toBe(true);
  });

  it('creates src and Cargo.toml for rust', () => {
    const w = new Workspace('rust');
    created.push(w);
    expect(fs.existsSync(`${w.root}/Cargo.toml`)).toBe(true);
    expect(fs.existsSync(`${w.root}/src`)).toBe(true);
  });

  it('mapClientUri maps inmemory uri to file uri and is stable', () => {
    const w = new Workspace('go');
    created.push(w);
    const a = w.mapClientUri('inmemory://model/1');
    const b = w.mapClientUri('inmemory://model/1');
    expect(a).toBe(b);
    expect(a.startsWith('file://')).toBe(true);
    expect(a).toContain('main.go');
  });

  it('mapClientUri returns file uris unchanged', () => {
    const w = new Workspace('go');
    created.push(w);
    const fileUri = 'file:///tmp/x';
    expect(w.mapClientUri(fileUri)).toBe(fileUri);
  });

  it('mapFileUri reverses mapping', () => {
    const w = new Workspace('rust');
    created.push(w);
    const client = 'inmemory://model/9';
    const file = w.mapClientUri(client);
    expect(w.mapFileUri(file)).toBe(client);
    expect(w.mapFileUri('file:///unknown')).toBe('file:///unknown');
  });

  it('writeFile writes through client uri mapping', () => {
    const w = new Workspace('go');
    created.push(w);
    const client = 'inmemory://model/2';
    w.mapClientUri(client);
    w.writeFile(client, 'package main');
    const fileUri = w.mapClientUri(client);
    const path = new URL(fileUri).pathname;
    expect(fs.readFileSync(path, 'utf-8')).toBe('package main');
  });

  it('writeFile no-ops when uri is unknown', () => {
    const w = new Workspace('go');
    created.push(w);
    w.writeFile('inmemory://unmapped', 'x');
  });

  it('dispose swallows rmSync errors', () => {
    vi.mocked(fs.rmSync).mockImplementationOnce(() => {
      throw new Error('fail');
    });
    const w = new Workspace('go');
    const root = w.root;
    expect(() => w.dispose()).not.toThrow();
    rmCtx.real!(root, { recursive: true, force: true });
  });
});
