import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

/**
 * The filebeat sample corpus, in the shape a real shipper sends.
 *
 * The archive carries Elastic-licensed data whose terms travel with it, so it is
 * read where it lies and never unpacked into this repo. Point
 * DFE_FILEBEAT_CORPUS at it; without it the corpus tests skip.
 */
export const CORPUS_ARCHIVE = process.env.DFE_FILEBEAT_CORPUS;

/** The modules the archive ships, and the data stream each one's events declare. */
export const CORPUS_MODULES = [
  'cisco_ios',
  'cisco_meraki',
  'cisco_umbrella',
] as const;

export type CorpusModule = (typeof CORPUS_MODULES)[number];

export const datasetOf = (beatsModule: CorpusModule) => `${beatsModule}.log`;

export const corpusAvailable = () =>
  !!CORPUS_ARCHIVE && existsSync(CORPUS_ARCHIVE);

/** One tar entry: the header's name and size, then its content. */
const tarEntries = (buffer: Buffer) => {
  const entries: { name: string; body: Buffer }[] = [];
  const BLOCK = 512;
  for (let at = 0; at + BLOCK <= buffer.length; ) {
    const name = buffer.toString('utf8', at, at + 100).replace(/\0.*$/, '');
    if (!name) {
      at += BLOCK;
      continue;
    }
    const size = parseInt(
      buffer
        .toString('utf8', at + 124, at + 136)
        .replace(/\0.*$/, '')
        .trim(),
      8,
    );
    const start = at + BLOCK;
    entries.push({ name, body: buffer.subarray(start, start + size) });
    at = start + Math.ceil(size / BLOCK) * BLOCK;
  }
  return entries;
};

/** Every raw vendor line in the archive, by module, capped at `limit` per module. */
export const corpusLines = (
  modules: readonly CorpusModule[] = CORPUS_MODULES,
  limit = 0,
): Record<string, string[]> => {
  if (!CORPUS_ARCHIVE) {
    throw new Error('DFE_FILEBEAT_CORPUS is not set');
  }
  const tar = gunzipSync(readFileSync(CORPUS_ARCHIVE));
  const out: Record<string, string[]> = {};
  for (const beatsModule of modules) {
    out[beatsModule] = [];
  }
  for (const entry of tarEntries(tar).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (!entry.name.endsWith('.log')) {
      continue;
    }
    const beatsModule = modules.find((m) => entry.name.startsWith(`${m}/`));
    if (!beatsModule) {
      continue;
    }
    for (const line of entry.body.toString('utf8').split('\n')) {
      if (!line.trim()) {
        continue;
      }
      if (limit && out[beatsModule].length >= limit) {
        break;
      }
      out[beatsModule].push(line);
    }
  }
  return out;
};

/**
 * One vendor line in the envelope Elastic Agent hands its ingest pipeline.
 *
 * The wrapper keys are the Agent's own, captured in dfe-transform-elastic's
 * tests/envelopes/beats/agent_cisco_ios.json. `data_stream.dataset` is the
 * identifier every beats source in the catalogue routes on.
 */
export const agentEnvelope = (
  beatsModule: CorpusModule,
  message: string,
  run: string,
) => ({
  '@timestamp': '2022-01-06T20:52:12.861Z',
  agent: {
    ephemeral_id: '960a0fda-a7b7-4362-9018-34b1d0d119c4',
    id: 'f00ff835-626e-4a18-a8a2-0bb3ebb7503f',
    name: 'docker-fleet-agent',
    type: 'filebeat',
    version: '8.0.0',
  },
  data_stream: {
    dataset: datasetOf(beatsModule),
    namespace: 'ep',
    type: 'logs',
  },
  elastic_agent: {
    id: 'f00ff835-626e-4a18-a8a2-0bb3ebb7503f',
    snapshot: false,
    version: '8.0.0',
  },
  event: { agent_id_status: 'verified', ingested: '2023-07-13T09:20:48Z' },
  input: { type: 'tcp' },
  log: { source: { address: '172.25.0.4:46792' } },
  message,
  tags: ['preserve_original_event', 'forwarded', `e2e_run:${run}`],
});

/**
 * The bundled filebeat pipeline each transform app runs, and the lookup table
 * it reads.
 *
 * Generated against the same integrations vintage as the corpus and shipped by
 * the deployment, so they are named rather than copied here.
 */
export const PROGRAMS: Record<string, { file: string; path?: string }> = {
  'dfe-transform-vrl': {
    file: '100_filebeat.vrl',
    path: process.env.DFE_FILEBEAT_VRL_PROGRAM,
  },
  'dfe-transform-vector': {
    file: '100_filebeat.yaml',
    path: process.env.DFE_FILEBEAT_VECTOR_PROGRAM,
  },
};

export const ENRICHMENT = {
  file: 'timezones.csv',
  path: process.env.DFE_FILEBEAT_ENRICHMENT,
};

export const programsAvailable = () =>
  Object.values(PROGRAMS).every(({ path }) => !!path && existsSync(path)) &&
  !!ENRICHMENT.path &&
  existsSync(ENRICHMENT.path);

export const readProgram = (path: string) => readFileSync(path, 'utf8');

/** The receiver's ingest endpoint on the stack under test. */
export const RECEIVER_URL =
  process.env.DFE_RECEIVER_URL || 'http://127.0.0.1:28080';

export const pushEnvelopes = async (events: unknown[]) => {
  const response = await fetch(`${RECEIVER_URL}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(events),
  });
  if (!response.ok) {
    throw new Error(
      `receiver refused the batch (${response.status}): ${await response.text()}`,
    );
  }
};

/**
 * Restart the containers a write said needed one.
 *
 * The engine reports `restart required: docker compose restart <service>` for
 * every app whose config it rewrote; on Compose nothing acts on that by itself,
 * so the test does what the operator would. Container names carry the stack's
 * own prefix, which is why it is a setting rather than a literal.
 */
export const CONTAINER_PREFIX = process.env.DFE_CONTAINER_PREFIX || 'e2e-';

export const restartFor = async (hints: string[]) => {
  const services = [
    ...new Set(
      hints
        .map((hint) => hint.split('docker compose restart ')[1]?.trim())
        .filter((service): service is string => !!service),
    ),
  ];
  for (const service of services) {
    execFileSync('docker', ['restart', `${CONTAINER_PREFIX}${service}`], {
      stdio: 'ignore',
    });
  }
  // A transform compiles its program before it serves /livez and joins its
  // consumer group, and a fresh group starts at the newest offset -- so
  // anything pushed before it is ready is skipped, not queued.
  for (const service of services) {
    await waitHealthy(`${CONTAINER_PREFIX}${service}`);
  }
  return services;
};

const waitHealthy = async (container: string, timeoutMs = 120_000) => {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    const state = execFileSync(
      'docker',
      ['inspect', '--format', '{{.State.Health.Status}}', container],
      { encoding: 'utf8' },
    ).trim();
    if (state === 'healthy') {
      return;
    }
    await new Promise((done) => setTimeout(done, 2_000));
  }
  throw new Error(`${container} did not report healthy within ${timeoutMs}ms`);
};
