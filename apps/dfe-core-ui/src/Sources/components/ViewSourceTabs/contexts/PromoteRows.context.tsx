'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface PromoteRowsContextValue {
  fieldsToPromote: Set<string>;
  handleAddPromoteField: (fieldPath: string) => void;
  handleRemovePromoteField: (fieldPath: string) => void;
  isFieldPromoted: (fieldPath: string) => boolean;
}

const PromoteRowsContext = createContext<PromoteRowsContextValue | null>(null);

export const usePromoteRowsContext = () => {
  const context = useContext(PromoteRowsContext);
  if (!context) {
    throw new Error(
      'usePromoteRowsContext must be used within PromoteRowsProvider',
    );
  }
  return context;
};

export interface PromoteRowsProviderProps {
  children: ReactNode;
  source_name: string;
  version: string;
}

export const PromoteRowsProvider = ({
  children,
  source_name: _source_name,
  version: _version,
}: PromoteRowsProviderProps) => {
  const [fieldsToPromote, setFieldsToPromote] = useState<Set<string>>(
    new Set(),
  );

  const handleAddPromoteField = useCallback((fieldPath: string) => {
    setFieldsToPromote(
      (prev) => new Set([...prev, fieldPath.replace('_json.', '')]),
    );
  }, []);

  const handleRemovePromoteField = useCallback((fieldPath: string) => {
    setFieldsToPromote((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fieldPath);
      return newSet;
    });
  }, []);

  const isFieldPromoted = useCallback(
    (fieldPath: string) => {
      return fieldsToPromote.has(fieldPath.replace('_json.', ''));
    },
    [fieldsToPromote],
  );

  const value = useMemo<PromoteRowsContextValue>(
    () => ({
      fieldsToPromote,
      handleAddPromoteField,
      handleRemovePromoteField,
      isFieldPromoted,
    }),
    [
      fieldsToPromote,
      handleAddPromoteField,
      handleRemovePromoteField,
      isFieldPromoted,
    ],
  );

  return (
    <PromoteRowsContext.Provider value={value}>
      {children}
    </PromoteRowsContext.Provider>
  );
};
