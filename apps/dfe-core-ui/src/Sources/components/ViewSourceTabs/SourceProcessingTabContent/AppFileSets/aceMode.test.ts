import { describe, expect, it } from 'vitest';
import { aceModeForFile } from './aceMode';

describe('aceModeForFile', () => {
  it('takes the mode from the extension, not the set language', () => {
    expect(aceModeForFile('lookup.json', 'data')).toBe('json');
    expect(aceModeForFile('lookup.yaml', 'data')).toBe('yaml');
    expect(aceModeForFile('lookup.yml', 'data')).toBe('yaml');
  });

  it('falls back to the set language when the extension says nothing', () => {
    expect(aceModeForFile('pipeline.conf', 'yaml')).toBe('yaml');
  });

  it('falls back to plain text rather than guessing a grammar', () => {
    expect(aceModeForFile('000_parse.vrl', 'vrl')).toBe('text');
    expect(aceModeForFile('table.csv', 'data')).toBe('text');
    expect(aceModeForFile('noextension', 'data')).toBe('text');
  });
});
