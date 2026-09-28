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
  cmd?: string;
};

export interface CRONBuilderContextValue {
  cronExpression: string;
  formValue: string;
  updateCronExpression: ({ atomic, raw }: CronExpression) => void;
  cronExplainer: {
    explainer: string | null;
    error: string | null;
  };
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

const emptyExplainer = { explainer: null, error: null };

export const CRONBuilderProvider = ({
  value: formValue = '',
  children,
}: CRONBuilderProviderProps) => {
  const [cronExpression, setCronExpression] = useState(formValue);
  const [cronExplainer, setCronExplainer] = useState<{
    explainer: string | null;
    error: string | null;
  }>(formValue ? explainCronExpression(formValue) : emptyExplainer);
  const [seenFormValue, setSeenFormValue] = useState(formValue);

  if (formValue !== seenFormValue) {
    setSeenFormValue(formValue);
    setCronExpression(formValue);
    setCronExplainer(
      formValue ? explainCronExpression(formValue) : emptyExplainer,
    );
  }

  const handleUpdateCron = useCallback(
    ({ atomic: changedAtomic, raw }: CronExpression) => {
      if (changedAtomic) {
        const atomic = {
          ...parseCronExpression(cronExpression),
          ...changedAtomic,
        };
        const cron = [
          atomic.minute ?? '*',
          atomic.hour ?? '*',
          atomic.day ?? '*',
          atomic.month ?? '*',
          atomic.week ?? '*',
          ...(atomic.cmd ? [atomic.cmd] : []),
        ].join(' ');
        setCronExpression(cron);
        const cronExplainer = explainCronExpression(cron);
        setCronExplainer(cronExplainer);
        return;
      }
      setCronExpression(raw || '');
      setCronExplainer(
        raw ? explainCronExpression(raw) : { explainer: null, error: null },
      );
    },
    [cronExpression],
  );

  const value = useMemo<CRONBuilderContextValue>(
    () => ({
      cronExpression,
      formValue,
      updateCronExpression: handleUpdateCron,
      cronExplainer,
    }),
    [cronExpression, formValue, handleUpdateCron, cronExplainer],
  );

  return (
    <CRONBuilderContext.Provider value={value}>
      {children}
    </CRONBuilderContext.Provider>
  );
};
