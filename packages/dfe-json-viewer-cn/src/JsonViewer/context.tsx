'use client';

import {
  ComponentType,
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

export interface JsonViewerContextValue {
  action?: ComponentType<JsonViewActionProps> | null;
}

const JsonViewerContext = createContext<JsonViewerContextValue | null>(null);

export const useJsonViewerContext = () => {
  const context = useContext(JsonViewerContext);
  if (!context) {
    throw new Error(
      'useJsonViewerContext must be used within JsonViewerProvider',
    );
  }
  return context;
};

interface JsonViewActionProps {
  fieldPath: string;
  level: number;
  value: unknown;
}

export interface JsonViewerProviderProps {
  children: ReactNode;
  action?: ComponentType<JsonViewActionProps> | null;
}

export const JsonViewerProvider = ({
  children,
  action,
}: JsonViewerProviderProps) => {
  const value = useMemo<JsonViewerContextValue>(
    () => ({
      action,
    }),
    [],
  );

  return (
    <JsonViewerContext.Provider value={value}>
      {children}
    </JsonViewerContext.Provider>
  );
};
