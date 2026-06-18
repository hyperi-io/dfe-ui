import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const INVALID_DATE_LABEL = 'Invalid date';
const EMPTY_DATE_LABEL = 'N/A';

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

export const formatDateXAgo = (date: string) => {
  const parsed = parseValidDate(date);
  if (!parsed) {
    return date?.trim() ? INVALID_DATE_LABEL : EMPTY_DATE_LABEL;
  }

  const diffInMinutes = dayjs().diff(parsed, 'minute');
  const diffInHours = dayjs().diff(parsed, 'hour');
  const diffInDays = dayjs().diff(parsed, 'day');
  const diffInMonths = dayjs().diff(parsed, 'month');
  const diffInYears = dayjs().diff(parsed, 'year');

  if (diffInYears > 0) {
    return `${diffInYears} years ago`;
  }
  if (diffInMonths > 0) {
    return `${diffInMonths} months ago`;
  }
  if (diffInDays > 0) {
    return `${diffInDays} days ago`;
  }
  if (diffInHours > 0) {
    return `${diffInHours} hours ago`;
  }
  if (diffInMinutes > 0) {
    return `${diffInMinutes} minutes ago`;
  }
  return 'just now';
};
