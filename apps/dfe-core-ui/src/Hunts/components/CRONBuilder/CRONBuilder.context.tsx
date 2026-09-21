'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  explainCronExpression,
  parseCronExpression,
} from './CRONBuilder.helpers';

type CronExpression = {
  atomic?: AtomicCronExpression;
  raw?: string;
};

type AtomicCronExpression = {
  minute?: string;
  hour?: string;
  day?: string;
  month?: string;
  week?: string;
};

export interface CRONBuilderContextValue {
  cronExpression: string;
  updateCronExpression: ({ atomic, raw }: CronExpression) => void;
  cronExplainer: string | null;
}

const CRONBuilderContext = createContext<CRONBuilderContextValue | null>(null);

export const useCRONBuilderContext = () => {
  const context = useContext(CRONBuilderContext);
  if (!context) {
    throw new Error(
      'useCRONBuilderContext must be used within CRONBuilderProvider',
    );
  }
  return context;
};

export interface CRONBuilderProviderProps {
  children: ReactNode;
  value?: string;
}

export const CRONBuilderProvider = ({
  value: formValue,
  children,
}: CRONBuilderProviderProps) => {
  const [cronExpression, setCronExpression] = useState(formValue || '');
  const [cronExplainer, setCronExplainer] = useState<string | null>(null);
  const handleUpdateCron = useCallback(
    ({ atomic: changedAtomic, raw }: CronExpression) => {
      if (changedAtomic) {
        const atomic = {
          ...parseCronExpression(cronExpression),
          ...changedAtomic,
        };
        const cron = `${atomic.minute ?? '*'} ${atomic.hour ?? '*'} ${atomic.day ?? '*'} ${atomic.month ?? '*'} ${atomic.week ?? '*'}`;
        setCronExpression(cron);
        const cronExplainer = explainCronExpression(cron);
        setCronExplainer(cronExplainer);
        return;
      }
      setCronExpression(raw || '');
    },
    [cronExpression],
  );

  const value = useMemo<CRONBuilderContextValue>(
    () => ({
      cronExpression,
      updateCronExpression: handleUpdateCron,
      cronExplainer,
    }),
    [cronExpression, handleUpdateCron, cronExplainer],
  );

  return (
    <CRONBuilderContext.Provider value={value}>
      {children}
    </CRONBuilderContext.Provider>
  );
};
