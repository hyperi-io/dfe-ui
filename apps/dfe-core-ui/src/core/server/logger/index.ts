import { scrubText, scrubValue } from './scrub';

/** scalo-py's level names, lowest first. */
export const LOG_LEVELS = [
  'TRACE',
  'DEBUG',
  'INFO',
  'SUCCESS',
  'WARNING',
  'ERROR',
  'CRITICAL',
] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

type Fields = Record<string, unknown>;
type Env = Record<string, string | undefined>;

const levelRank = (level: string | undefined): number => {
  const wanted = level?.trim().toUpperCase() === 'WARN' ? 'WARNING' : level;
  const index = LOG_LEVELS.indexOf(wanted?.trim().toUpperCase() as LogLevel);
  return index === -1 ? LOG_LEVELS.indexOf('INFO') : index;
};

/** JSON in production or wherever OTel is wired, text on a developer's terminal, as scalo's `auto` does. */
export const writesJson = (env: Env): boolean => {
  const format = env.LOG_FORMAT?.trim().toLowerCase();
  if (format === 'json') return true;
  if (format === 'text' || format === 'pretty' || format === 'human')
    return false;
  return (
    env.NODE_ENV === 'production' || !!env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()
  );
};

/** One record in scalo-py's JSON shape: fields sit under one key so none can overwrite the record's own. */
export const formatRecord = (
  level: LogLevel,
  target: string,
  message: string,
  fields: Fields,
  json: boolean,
  now: Date = new Date(),
): string => {
  const clean = scrubValue(fields) as Fields;
  // scalo writes microseconds, and a JS clock holds milliseconds.
  const timestamp = now.toISOString().replace('Z', '000Z');
  if (json) {
    return JSON.stringify({
      timestamp,
      level,
      target,
      message: scrubText(message),
      fields: clean,
    });
  }
  const extras = Object.entries(clean)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(' ');
  return `${timestamp} ${level.padEnd(8)} ${target}: ${scrubText(message)}${extras ? ` ${extras}` : ''}`;
};

/** A server logger writing one line per record to stdout, at or above LOG_LEVEL. */
export const createLogger = (
  target: string,
  env: Env = process.env,
  // eslint-disable-next-line no-console -- stdout is where the log contract wants these lines
  write: (line: string) => void = (line) => console.log(line),
) => {
  const threshold = levelRank(env.LOG_LEVEL);
  const json = writesJson(env);
  const emit =
    (level: LogLevel) =>
    (message: string, fields: Fields = {}) => {
      if (levelRank(level) < threshold) return;
      write(formatRecord(level, target, message, fields, json));
    };
  return {
    debug: emit('DEBUG'),
    info: emit('INFO'),
    warn: emit('WARNING'),
    error: emit('ERROR'),
  };
};

export type Logger = ReturnType<typeof createLogger>;
