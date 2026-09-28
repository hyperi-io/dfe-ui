import cronstrue from 'cronstrue';

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

export const explainCronExpression = (cronExpression: string) => {
  const cronExplainer = cronstrue.toString(cronExpression);

  return `This hunt will run ${cronExplainer?.charAt(0).toLowerCase() + cronExplainer?.slice(1)}`;
};

export const resetCronExpression = (key: string) => {
  switch (key) {
    case 'minutes':
      return '*/1 * * * *';
    case 'hourly':
      return '0 */1 * * *';
    case 'daily':
      return '0 0 1 * *';
    case 'weekly':
      return '0 0 0 * SUN-SAT';
    case 'monthly':
    case 'custom':
    default:
      return '* * * * *';
  }
};
