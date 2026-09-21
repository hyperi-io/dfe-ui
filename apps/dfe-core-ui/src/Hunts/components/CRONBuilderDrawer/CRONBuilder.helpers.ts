export const getCronExpression = ({
  minute,
  hour,
  day,
  month,
  week,
}: {
  minute: number;
  hour: number;
  day: number;
  month: number;
  week: number;
}) => {
  return `${minute} ${hour} ${day} ${month} ${week}`;
};

export const parseCronExpression = (cronExpression: string) => {
  const [minute, hour, day, month, week] = cronExpression.split(' ');
  return { minute, hour, day, month, week };
};

const explanationFormatter = (value: string, unit: string) => {
  return `every ${value} ${unit}${Number(value) > 1 ? 's' : ''}`;
};
export const explainCronExpression = (cronExpression: string) => {
  const { minute, hour, day, month, week } =
    parseCronExpression(cronExpression);
  const explanation = [];
  if (minute !== '*') {
    explanation.push(explanationFormatter(minute, 'minute'));
  }
  if (hour !== '*') {
    explanation.push(explanationFormatter(hour, 'hour'));
  }
  if (day !== '*') {
    explanation.push(explanationFormatter(day, 'day'));
  }
  if (month !== '*') {
    explanation.push(explanationFormatter(month, 'month'));
  }
  if (week !== '*') {
    explanation.push(explanationFormatter(week, 'week'));
  }
  return 'This hunt will run ' + explanation.join(', ');
};
