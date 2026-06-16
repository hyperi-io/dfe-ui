export const randomTimestampBetweenOneMonthAgoAndNow = (): string => {
  const now = Date.now();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  const lo = start.getTime();
  return new Date(lo + Math.random() * (now - lo)).toISOString();
};
