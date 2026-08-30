import { describe, expect, it } from 'vitest';
import { summariseBuckets } from './summariseBuckets';

const bucket = (
  metric: string,
  epoch: number,
  values: {
    minimum: number;
    maximum: number;
    average: number;
    p95: number;
    samples: number;
  },
) => ({ metric, bucket_epoch: epoch, ...values });

describe('summariseBuckets', () => {
  it('returns one row per metric, newest bucket as the latest reading', () => {
    const rows = summariseBuckets([
      bucket('cpu', 200, {
        minimum: 1,
        maximum: 4,
        average: 2,
        p95: 3,
        samples: 10,
      }),
      bucket('cpu', 100, {
        minimum: 0,
        maximum: 9,
        average: 1,
        p95: 8,
        samples: 10,
      }),
      bucket('memory', 100, {
        minimum: 5,
        maximum: 5,
        average: 5,
        p95: 5,
        samples: 1,
      }),
    ]);

    expect(rows.map((row) => row.metric)).toEqual(['cpu', 'memory']);
    expect(rows[0].latest).toBe(2);
    expect(rows[0].peak).toBe(9);
    expect(rows[0].p95).toBe(8);
    expect(rows[0].samples).toBe(20);
  });

  it('weights the average by sample count so a quiet bucket counts for less', () => {
    const rows = summariseBuckets([
      bucket('cpu', 100, {
        minimum: 0,
        maximum: 1,
        average: 1,
        p95: 1,
        samples: 90,
      }),
      bucket('cpu', 200, {
        minimum: 0,
        maximum: 11,
        average: 11,
        p95: 11,
        samples: 10,
      }),
    ]);

    expect(rows[0].average).toBe(2);
  });

  it('returns nothing when the window held no buckets', () => {
    expect(summariseBuckets([])).toEqual([]);
  });
});
