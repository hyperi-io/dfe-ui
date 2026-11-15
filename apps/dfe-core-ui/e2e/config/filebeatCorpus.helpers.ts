import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parse } from 'yaml';

import { CONTAINER_PREFIX } from './engineApi.helpers';

/**
 * The synthetic filebeat cases, in the shape a real shipper sends.
 *
 * The cases live in a dfe-engine checkout at tests/e2e/filebeat_cases.yaml.
 * Point DFE_ENGINE_DIR at it, and without it the corpus tests skip.
 */
export const CORPUS_FILE = process.env.DFE_ENGINE_DIR
  ? join(process.env.DFE_ENGINE_DIR, 'tests/e2e/filebeat_cases.yaml')
  : undefined;

/** The modules the cases cover, and the key each uses in the YAML. */
const CASE_MODULE = {
  cisco_ios: 'ios',
  cisco_meraki: 'meraki',
  cisco_umbrella: 'umbrella',
} as const;

export const CORPUS_MODULES = Object.keys(CASE_MODULE) as CorpusModule[];

export type CorpusModule = keyof typeof CASE_MODULE;

export const datasetOf = (beatsModule: CorpusModule) => `${beatsModule}.log`;

export const corpusAvailable = () => !!CORPUS_FILE && existsSync(CORPUS_FILE);

/** Every raw vendor line in the cases, by module, capped at `limit` per module. */
export const corpusLines = (
  modules: readonly CorpusModule[] = CORPUS_MODULES,
  limit = 0,
): Record<string, string[]> => {
  if (!CORPUS_FILE) {
    throw new Error('DFE_ENGINE_DIR is not set');
  }
  const cases = parse(readFileSync(CORPUS_FILE, 'utf8')) as {
    module: string;
    line: string;
  }[];
  const out: Record<string, string[]> = {};
  for (const beatsModule of modules) {
    out[beatsModule] = cases
      .filter((entry) => entry.module === CASE_MODULE[beatsModule])
      .map((entry) => entry.line.trim())
      .slice(0, limit || undefined);
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
 * Generated against the same integrations vintage as the cases and shipped by
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
 * The dfe-docker checkout running the stack under test.
 *
 * `make apply` there re-resolves the stack, so it creates the container a new
 * per-source instance has yet to get -- a service that exists only in the
 * fragment `make` chains, so no plain `docker compose` call can name it.
 * DFE_DOCKER_APPLY_ARGS adds make variables to that call: `DEV=1` for a stack
 * `make dev` started, which otherwise has the named services recreated from the
 * registry images.
 */
export const DOCKER_DIR = process.env.DFE_DOCKER_DIR;

const APPLY_ARGS = (process.env.DFE_DOCKER_APPLY_ARGS ?? '')
  .split(/\s+/)
  .filter((arg) => !!arg);

/**
 * The compose service one hint names.
 *
 * The engine names it as `make apply SERVICES=<service>`; an engine image from
 * before that names it at the end of a `docker compose` command.
 */
const serviceOf = (hint: string) =>
  /SERVICES=(\S+)/.exec(hint)?.[1] ??
  /docker compose (?:restart|up -d) (\S+)/.exec(hint)?.[1];

const containerExists = (container: string) => {
  try {
    execFileSync('docker', ['inspect', '--format', '{{.Id}}', container], {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Apply what the engine's hints say a write needs, the way an operator would.
 *
 * On Compose nothing acts on a hint by itself. `make apply` creates a missing
 * container and recreates one whose definition changed, but leaves the rest
 * alone, and a mounted config is not part of the definition -- so every
 * container that existed before the apply is restarted to read its new config.
 */
export const restartFor = async (hints: string[]) => {
  const services = [
    ...new Set(
      hints.map(serviceOf).filter((service): service is string => !!service),
    ),
  ];
  if (!services.length) {
    return services;
  }
  if (!DOCKER_DIR) {
    throw new Error(
      `DFE_DOCKER_DIR is not set: name the dfe-docker checkout running the stack, so make apply can act on ${services.join(', ')}`,
    );
  }
  const existing = services.filter((service) =>
    containerExists(`${CONTAINER_PREFIX}${service}`),
  );
  execFileSync(
    'make',
    ['apply', `SERVICES=${services.join(' ')}`, ...APPLY_ARGS],
    { cwd: DOCKER_DIR, encoding: 'utf8' },
  );
  for (const service of existing) {
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
