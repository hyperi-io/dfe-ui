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

      expect(url).toMatch(/worker-(json|javascript|yaml)\.js$/);
      expect(url).not.toMatch(/cdn|jsdelivr|unpkg/);
    },
  );
});
