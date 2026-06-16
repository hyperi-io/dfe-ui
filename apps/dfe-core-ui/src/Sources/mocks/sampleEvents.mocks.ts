import { v4 as uuidv4 } from 'uuid';

const randomTimestampBetweenOneMonthAgoAndNow = (): string => {
  const now = Date.now();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  const lo = start.getTime();
  return new Date(lo + Math.random() * (now - lo)).toISOString();
};

export type SampleEventDateRange = {
  start: string;
  end: string;
};

export type SampleEvent = {
  _timestamp_load: string;
  _timestamp: string;
  _timestamp_received: string;
  _uuid: string;
  _org_id: string;
  _source: string;
  _raw: string;
  _json: {
    '@timestamp': string;
    message: string;
    host: { name: string };
    source: { ip: string };
    user: { name: string };
    tags: { collector: { type: string } };
    _source: string;
    org_id: string;
  };
  _tags: { collector: { type: string } };
  message: string;
  user_name: string;
  source_ip: string;
  severity: string | null;
};

const MOCK_SAMPLE_EVENTS_DELAY_MS = 400;

const SAMPLE_EVENT_TEMPLATES = [
  {
    message: 'Failed password for user root',
    user_name: 'root',
    source_ip: '10.0.1.42',
    host: 'web-01',
    severity: 'medium' as const,
  },
  {
    message: 'Accepted publickey for deploy from 10.0.2.15',
    user_name: 'deploy',
    source_ip: '10.0.2.15',
    host: 'app-02',
    severity: null,
  },
  {
    message: 'Connection closed by authenticating user admin',
    user_name: 'admin',
    source_ip: '192.168.0.88',
    host: 'bastion-01',
    severity: 'low' as const,
  },
  {
    message: 'sudo: user ops : TTY=pts/0 ; PWD=/var/log ; USER=root',
    user_name: 'ops',
    source_ip: '10.0.3.7',
    host: 'db-01',
    severity: null,
  },
];

const randomTimestampInRange = (date_range?: SampleEventDateRange): string => {
  if (!date_range) {
    return randomTimestampBetweenOneMonthAgoAndNow();
  }

  const startMs = new Date(date_range.start).getTime();
  const endMs = new Date(date_range.end).getTime();
  const lo = Math.min(startMs, endMs);
  const hi = Math.max(startMs, endMs);

  return new Date(lo + Math.random() * (hi - lo)).toISOString();
};

const offsetIsoTimestamp = (iso: string, offsetMs: number): string => {
  return new Date(new Date(iso).getTime() + offsetMs).toISOString();
};

const createSampleEvent = ({
  source_name,
  index,
  date_range,
}: {
  source_name: string;
  index: number;
  date_range?: SampleEventDateRange;
}): SampleEvent => {
  const template =
    SAMPLE_EVENT_TEMPLATES[index % SAMPLE_EVENT_TEMPLATES.length];
  const _timestamp = randomTimestampInRange(date_range);
  const _timestamp_received = offsetIsoTimestamp(_timestamp, 77);
  const _timestamp_load = offsetIsoTimestamp(_timestamp, 1333);
  const eventTimestamp = _timestamp.replace(/\.\d{3}Z$/, 'Z');

  const _json = {
    '@timestamp': eventTimestamp,
    message: template.message,
    host: { name: template.host },
    source: { ip: template.source_ip },
    user: { name: template.user_name },
    tags: { collector: { type: source_name } },
    _source: source_name,
    org_id: 'acme',
  };

  return {
    _timestamp_load,
    _timestamp,
    _timestamp_received,
    _uuid: uuidv4(),
    _org_id: 'acme',
    _source: source_name,
    _raw: JSON.stringify(_json),
    _json,
    _tags: { collector: { type: source_name } },
    message: template.message,
    user_name: template.user_name,
    source_ip: template.source_ip,
    severity: template.severity,
  };
};

export const generateMockSampleEvents = ({
  source_name,
  date_range,
  count = 20,
}: {
  source_name: string;
  date_range?: SampleEventDateRange;
  count?: number;
}): SampleEvent[] => {
  const safeCount = Math.max(0, Math.min(count, 100));

  return Array.from({ length: safeCount }, (_, index) =>
    createSampleEvent({ source_name, index, date_range }),
  );
};

export const fetchMockSampleEvents = async (
  params: {
    source_name: string;
    date_range?: SampleEventDateRange;
    count?: number;
  },
  signal?: AbortSignal,
): Promise<SampleEvent[]> => {
  await new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => resolve(), MOCK_SAMPLE_EVENTS_DELAY_MS);

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId);
        reject(signal.reason);
      },
      { once: true },
    );
  });

  if (signal?.aborted) {
    throw signal.reason;
  }

  return generateMockSampleEvents(params);
};
