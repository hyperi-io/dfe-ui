import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, test } from 'vitest';

const WORKER_URL = 'http://localhost/_next/static/media/worker-yaml.abc123.js';
const WORKER_SOURCE = readFileSync(
  createRequire(import.meta.url).resolve(
    'ace-builds/src-noconflict/worker-yaml.js',
  ),
  'utf8',
);
const SHIM_SOURCE = readFileSync(
  path.join(import.meta.dirname, 'yamlWorkerShim.js'),
  'utf8',
);

type Message = { type: string; name?: string; data?: unknown };

/**
 * Runs Ace's real YAML worker in a bare global with the one thing a browser
 * worker adds, importScripts, which can fetch only the worker itself.
 */
const startWorker = (viaShim: boolean) => {
  const requested: string[] = [];
  const posted: Message[] = [];
  const context = vm.createContext({
    postMessage: (message: Message) => posted.push(message),
    setTimeout,
    clearTimeout,
    location: { hash: `#${encodeURIComponent(WORKER_URL)}` },
    importScripts: (url: string) => {
      requested.push(url);
      if (url !== WORKER_URL) throw new Error(`NetworkError: ${url}`);
      vm.runInContext(WORKER_SOURCE, context);
    },
  });
  vm.runInContext('var self = this;', context);
  if (viaShim) {
    vm.runInContext(SHIM_SOURCE, context);
  } else {
    vm.runInContext(`importScripts(${JSON.stringify(WORKER_URL)})`, context);
  }
  const send = (data: object) =>
    vm.runInContext(
      `onmessage.call(this, ${JSON.stringify({ data })})`,
      context,
    );
  send({
    init: true,
    module: 'ace/mode/yaml_worker',
    classname: 'YamlWorker',
  });
  return { requested, posted, send };
};

const nextAnnotation = (posted: Message[]) =>
  new Promise<unknown>((resolve, reject) => {
    const deadline = Date.now() + 5_000;
    const poll = () => {
      const found = posted.find((m) => m.name === 'annotate');
      if (found) resolve(found.data);
      else if (Date.now() > deadline) reject(new Error('no annotation posted'));
      else setTimeout(poll, 20);
    };
    poll();
  });

describe('YAML worker shim', () => {
  test('without it the worker asks for buffer.js and esprima.js, which the server does not have', () => {
    const { requested } = startWorker(false);

    expect(requested).toContain('buffer.js');
    expect(requested).toContain('esprima.js');
  });

  test('with it the worker requests nothing but itself', () => {
    const { requested } = startWorker(true);

    expect(requested).toEqual([WORKER_URL]);
  });

  test('with it the worker still reports a YAML syntax error', async () => {
    const { posted, send } = startWorker(true);

    send({ command: 'setValue', args: ['key: value\n  bad: [unclosed\n'] });

    const annotations = (await nextAnnotation(posted)) as {
      type: string;
      row: number;
    }[];
    expect(annotations[0]).toMatchObject({ type: 'error', row: 1 });
  });

  test('with it the worker reports no error for valid YAML', async () => {
    const { posted, send } = startWorker(true);

    send({ command: 'setValue', args: ['key: value\nlist:\n  - a\n  - b\n'] });

    expect(await nextAnnotation(posted)).toEqual([]);
  });
});
