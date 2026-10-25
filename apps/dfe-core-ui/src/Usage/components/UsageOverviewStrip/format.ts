import { TUsageMetric } from '@/Usage/hooks/useFetchUsageOverview/types';
import dayjs from 'dayjs';

/** Decimal units, so a figure reads the same as the GB/day a deployment is licensed on. */
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

const number = (value: number, digits: number) =>
  value.toLocaleString('en-AU', { maximumFractionDigits: digits });

export const formatBytes = (value: number) => {
  let scaled = value;
  let unit = 0;
  while (Math.abs(scaled) >= 1000 && unit < BYTE_UNITS.length - 1) {
    scaled /= 1000;
    unit += 1;
  }
  return `${number(scaled, scaled >= 100 ? 0 : 2)} ${BYTE_UNITS[unit]}`;
};

/** A metric's value in the unit the engine counts it in. Bytes are one UTC day's total. */
export const formatUsageValue = (
  metric: Pick<TUsageMetric, 'unit'>,
  value: number,
) => {
  if (metric.unit === 'bytes') return `${formatBytes(value)}/day`;
  if (metric.unit === 'events/s') return `${number(value, 1)}/s`;
  return number(value, 1);
};

export const formatUsageDay = (day: string) => dayjs(day).format('D MMM');
