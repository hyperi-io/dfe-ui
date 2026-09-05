import { existsSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

/**
 * Real filebeat sample lines, read straight out of dfe-transform-vrl's archive.
 *
 * The corpus carries Elastic-licensed data whose terms travel with it, so it is
 * never unpacked into this repo -- the path is supplied by the harness and the
 * archive is read in memory. No corpus, no test: the spec skips.
 *
 * Each line becomes the DFE 2.1 Kafka shape the bundled VRL consumes,
 * `{message, tags, _source}`, with tags a list of strings because the pipeline
 * calls `includes(array!(.tags), ...)` and aborts on a map.
 */

export interface FilebeatSample {
  module: string;
  line: string;
}

const MODULES = ['cisco_umbrella', 'cisco_ios', 'cisco_meraki'];
const BLOCK = 512;

const corpusPath = (): string => process.env.E2E_FILEBEAT_CORPUS || '';

/** Entries of a POSIX tar, enough of the header to find `.log` members. */
const tarEntries = (archive: Buffer): { name: string; body: Buffer }[] => {
  const entries: { name: string; body: Buffer }[] = [];
  let offset = 0;
  while (offset + BLOCK <= archive.length) {
    const header = archive.subarray(offset, offset + BLOCK);
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    if (name === '') break;
    const size = parseInt(
      header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim() ||
        '0',
      8,
    );
    const start = offset + BLOCK;
    entries.push({ name, body: archive.subarray(start, start + size) });
    offset = start + Math.ceil(size / BLOCK) * BLOCK;
  }
  return entries;
};

/** Up to *perModule* lines from each module, so every branch is exercised. */
export const filebeatCorpus = (perModule = 5): FilebeatSample[] => {
  const path = corpusPath();
  if (!path || !existsSync(path)) return [];

  const archive = gunzipSync(readFileSync(path));
  const seen = new Map(MODULES.map((module) => [module, 0]));
  const samples: FilebeatSample[] = [];

  for (const entry of tarEntries(archive).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    // Not `module`: Next's no-assign-module-variable rejects that name here.
    const moduleName = MODULES.find((name) =>
      entry.name.startsWith(`${name}/`),
    );
    if (!moduleName || !entry.name.endsWith('.log')) continue;
    for (const line of entry.body.toString('utf8').split('\n')) {
      if (!line.trim() || (seen.get(moduleName) ?? 0) >= perModule) continue;
      samples.push({ module: moduleName, line });
      seen.set(moduleName, (seen.get(moduleName) ?? 0) + 1);
    }
  }
  return samples;
};

export const filebeatEvent = (
  sample: FilebeatSample,
  run: string,
): Record<string, unknown> => ({
  message: sample.line,
  tags: [`corpus_module:${sample.module}`, `acc_run:${run}`],
  _source: 'filebeat',
});
