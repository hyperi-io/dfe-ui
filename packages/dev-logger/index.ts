export const devLogger = ({
  level,
  label,
  message,
}: {
  level: 'warn' | 'error' | 'info';
  label?: string;
  message: string;
}) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const line = `[DEV LOGGER]${label ? ` [${label}]: ` : ': '}${message}`;

  switch (level) {
    case 'warn':
      console.warn(line);
      break;
    case 'error':
      console.error(line);
      break;
    case 'info':
    default:
      console.info(line);
      break;
  }
};
