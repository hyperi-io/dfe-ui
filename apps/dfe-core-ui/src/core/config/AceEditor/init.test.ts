import { describe, expect, test } from 'vitest';
import ace from './init';

const WORKERS = [
  'ace/mode/json_worker',
  'ace/mode/javascript_worker',
  'ace/mode/yaml_worker',
];

describe('Ace worker loading', () => {
  test('workers load as themselves, not through a blob the CSP would have to allow', () => {
    expect(ace.config.get('loadWorkerFromBlob')).toBe(false);
  });

  test.each(WORKERS)(
    '%s comes from the installed package, never a CDN',
    (worker) => {
      const url = ace.config.moduleUrl(worker, 'worker');

      expect(decodeURIComponent(url)).toMatch(
        /worker-(json|javascript|yaml)\.js$/,
      );
      expect(url).not.toMatch(/cdn|jsdelivr|unpkg/);
    },
  );

  test('the YAML worker starts through the shim, which names the worker to load', () => {
    const url = new URL(ace.config.moduleUrl('ace/mode/yaml_worker', 'worker'));

    expect(url.pathname).toMatch(/yamlWorkerShim[^/]*\.js$/);
    expect(decodeURIComponent(url.hash.slice(1))).toMatch(
      /worker-yaml[^/]*\.js$/,
    );
  });
});
