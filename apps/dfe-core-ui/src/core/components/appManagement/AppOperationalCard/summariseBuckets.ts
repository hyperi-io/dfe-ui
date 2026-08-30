import { TAppResourceBucket } from '@/core/hooks/apps/operations/useFetchAppResourceSeries/types';

export type TResourceSummary = {
  metric: string;
  latest: number;
  peak: number;
  average: number;
  p95: number;
  samples: number;
};

/**
 * Collapse the per-bucket series into one row per metric.
 *
 * The dials are set once, so what informs them is the window as a whole: the
 * peak says whether a limit is close to being hit, the average says whether a
 * request is wildly over-provisioned. `average` is weighted by sample count so
 * a sparse bucket does not count as much as a busy one.
 */
export const summariseBuckets = (
  buckets: TAppResourceBucket[],
): TResourceSummary[] => {
  const byMetric = new Map<string, TAppResourceBucket[]>();
  for (const bucket of buckets) {
    const found = byMetric.get(bucket.metric);
    if (found) {
      found.push(bucket);
    } else {
      byMetric.set(bucket.metric, [bucket]);
    }
  }

  return [...byMetric.entries()]
    .map(([metric, metricBuckets]) => {
      const ordered = [...metricBuckets].sort(
        (a, b) => a.bucket_epoch - b.bucket_epoch,
      );
      const samples = ordered.reduce(
        (total, bucket) => total + bucket.samples,
        0,
      );
      const weighted = ordered.reduce(
        (total, bucket) => total + bucket.average * bucket.samples,
        0,
      );
      return {
        metric,
        latest: ordered[ordered.length - 1].average,
        peak: Math.max(...ordered.map((bucket) => bucket.maximum)),
        average: samples > 0 ? weighted / samples : 0,
        p95: Math.max(...ordered.map((bucket) => bucket.p95)),
        samples,
      };
    })
    .sort((a, b) => a.metric.localeCompare(b.metric));
};
