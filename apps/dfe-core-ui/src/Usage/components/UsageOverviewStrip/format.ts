import { formatBytes, formatDecimal } from '@/core/helpers/format.helpers';
import { TUsageMetric } from '@/Usage/hooks/useFetchUsageOverview/types';
import dayjs from 'dayjs';

/** A metric's value in the unit the engine counts it in. Bytes are one UTC day's total. */
export const formatUsageValue = (
  metric: Pick<TUsageMetric, 'unit'>,
  value: number,
) => {
  if (metric.unit === 'bytes') return `${formatBytes(value)}/day`;
  if (metric.unit === 'events/s') return `${formatDecimal(value, 1)}/s`;
  return formatDecimal(value, 1);
};

export const formatUsageDay = (day: string) => dayjs(day).format('D MMM');
