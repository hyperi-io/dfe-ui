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

  switch (level) {
    case 'warn':
      console.warn(`[DEV LOGGER]${label ? ` [${label}]: ` : ': '}`, message);
      break;
    case 'error':
      console.error(`[DEV LOGGER]${label ? ` [${label}]: ` : ': '}`, message);
      break;
    case 'info':
    default:
      console.info(`[DEV LOGGER]${label ? ` [${label}]: ` : ': '}`, message);
      break;
  }
};
