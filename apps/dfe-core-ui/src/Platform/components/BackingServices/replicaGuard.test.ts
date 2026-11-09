import { describe, expect, it } from 'vitest';
import {
  checkReplicaChange,
  GENERIC_DECREASE_REASON,
  REPLICA_DECREASE_REASON,
} from './replicaGuard';

describe('checkReplicaChange', () => {
  it('allows a raise', () => {
    expect(checkReplicaChange('kafka', 3, 5)).toEqual({ allowed: true });
  });

  it('refuses a Kafka decrease with the partition-movement reason', () => {
    const check = checkReplicaChange('kafka', 5, 3);

    expect(check.allowed).toBe(false);
    expect(check.reason).toBe(REPLICA_DECREASE_REASON.kafka);
    expect(check.reason).toContain('partition');
  });

  it('refuses a ClickHouse decrease with the lost-copy reason', () => {
    const check = checkReplicaChange('clickhouse', 3, 2);

    expect(check.allowed).toBe(false);
    expect(check.reason).toBe(REPLICA_DECREASE_REASON.clickhouse);
    expect(check.reason).toContain('shard');
  });

  it('refuses a decrease for a service it has no specific reason for', () => {
    const check = checkReplicaChange('some-new-store', 4, 1);

    expect(check.allowed).toBe(false);
    expect(check.reason).toBe(GENERIC_DECREASE_REASON);
  });

  it('refuses a count below one, and a fractional one', () => {
    expect(checkReplicaChange('kafka', 3, 0).allowed).toBe(false);
    expect(checkReplicaChange('kafka', 3, 2.5).allowed).toBe(false);
  });

  it('allows an undeclared count but says the tier default is invisible', () => {
    const check = checkReplicaChange('kafka', null, 1);

    expect(check.allowed).toBe(true);
    expect(check.caution).toContain('tier');
    expect(check.reason).toBeUndefined();
  });

  it('treats an equal count as allowed rather than a decrease', () => {
    expect(checkReplicaChange('kafka', 3, 3)).toEqual({ allowed: true });
  });
});
