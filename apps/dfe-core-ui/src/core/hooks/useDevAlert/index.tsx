export const useDevAlert = () => {
  const isDevAlertsEnabled =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DEV_ALERTS === 'true';

  return {
    isDevAlertsEnabled,
  };
};
