/* import-scope-drift-disable - (exported for tests) */
import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const INVALID_DATE_LABEL = 'Invalid date';
const EMPTY_DATE_LABEL = 'N/A';
// Largest first: the first unit with a whole count names the age.
const AGO_UNITS = ['year', 'month', 'day', 'hour', 'minute'] as const;

export const parseValidDate = (
  date: string | null | undefined,
): Dayjs | null => {
  if (date == null || String(date).trim() === '') {
    return null;
  }

  const trimmed = String(date).trim();
  if (Number.isNaN(Date.parse(trimmed))) {
    return null;
  }

  const parsed = dayjs(trimmed);
  return parsed.isValid() ? parsed : null;
};

export const formatDateToString = (date: string) => {
  const parsed = parseValidDate(date);
  if (!parsed) {
    return date?.trim() ? INVALID_DATE_LABEL : EMPTY_DATE_LABEL;
  }

  return parsed.utc().format('DD MMM YYYY, HH:mm');
};

/** Epoch seconds as the viewer's local date and time. */
export const formatEpochSecondsLocal = (seconds: number) => {
  const parsed = dayjs.unix(seconds);
  return Number.isFinite(seconds) && parsed.isValid()
    ? parsed.format('DD MMM YYYY, HH:mm:ss')
    : INVALID_DATE_LABEL;
};

export const formatDateXAgo = (date: string) => {
  const parsed = parseValidDate(date);
  if (!parsed) {
    return date?.trim() ? INVALID_DATE_LABEL : EMPTY_DATE_LABEL;
  }

  for (const unit of AGO_UNITS) {
    const count = dayjs().diff(parsed, unit);
    if (count > 0) {
      return `${count} ${unit}${count === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
};
/* import-scope-drift-enable */
