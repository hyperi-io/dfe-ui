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
  try {
    const cronExplainer = cronstrue.toString(cronExpression);

    return {
      explainer: `This hunt will run ${cronExplainer.charAt(0).toLowerCase()}${cronExplainer.slice(1)}`,
      error: null,
    };
  } catch (error) {
    return { explainer: null, error: error as string };
  }
};

export const resetCronExpression = (key: string) => {
  switch (key) {
    case 'minutes':
      return '*/1 * * * *';
    case 'hourly':
      return '0 */1 * * *';
    case 'daily':
      return '0 0 */1 * *';
    case 'weekly':
      return '0 1 * * MON,TUE,WED,THU,FRI';
    case 'monthly':
    case 'custom':
    default:
      return '* * * * *';
  }
};
