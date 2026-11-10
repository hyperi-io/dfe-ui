/** Decimal units, so a figure reads the same as the GB/day a deployment is licensed on. */
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export const formatDecimal = (value: number, digits: number) =>
  value.toLocaleString('en-AU', { maximumFractionDigits: digits });

export const formatBytes = (value: number) => {
  let scaled = value;
  let unit = 0;
  while (Math.abs(scaled) >= 1000 && unit < BYTE_UNITS.length - 1) {
    scaled /= 1000;
    unit += 1;
  }
  return `${formatDecimal(scaled, scaled >= 100 ? 0 : 2)} ${BYTE_UNITS[unit]}`;
};
