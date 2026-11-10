import { describe, expect, it } from 'vitest';
import {
  CLICKHOUSE_MEMORY_DOWN_WARNING,
  memoryDownWarning,
} from './ResourceField';

const path = 'resources.requests.memory';

describe('memoryDownWarning', () => {
  it('warns when ClickHouse memory is lowered', () => {
    expect(memoryDownWarning('clickhouse', path, '2Gi', '512Mi')).toBe(
      CLICKHOUSE_MEMORY_DOWN_WARNING,
    );
  });

  it('stays quiet when memory is raised or unchanged', () => {
    expect(
      memoryDownWarning('clickhouse', path, '512Mi', '2Gi'),
    ).toBeUndefined();
    expect(memoryDownWarning('clickhouse', path, '2Gi', '2Gi')).toBeUndefined();
  });

  it('stays quiet for CPU, which has no in-flight query cost', () => {
    expect(
      memoryDownWarning('clickhouse', 'resources.limits.cpu', '4', '1'),
    ).toBeUndefined();
  });

  it('stays quiet for other services', () => {
    expect(memoryDownWarning('kafka', path, '2Gi', '512Mi')).toBeUndefined();
  });

  it('stays quiet when the current value is a tier default it cannot compare', () => {
    expect(
      memoryDownWarning('clickhouse', path, null, '512Mi'),
    ).toBeUndefined();
  });
});
