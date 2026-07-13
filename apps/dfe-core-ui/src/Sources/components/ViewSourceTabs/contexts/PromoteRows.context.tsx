'use client';

import { useFetchSampleRows } from '@/Sources/hooks/useFetchSampleRows';
import { TSampleRowsResponse } from '@/Sources/hooks/useFetchSampleRows/types';
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
  handleClearFieldsToPromote: () => void;
  isFieldPromoted: (fieldPath: string) => boolean;
  sampleRows: TSampleRowsResponse | undefined;
  isLoadingSampleRows: boolean;
  errorSampleRows: Error | null;
  promotedOnSchemaFieldsSet: Set<string>;
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
  source_name,
  version,
}: PromoteRowsProviderProps) => {
  const [fieldsToPromote, setFieldsToPromote] = useState<Set<string>>(
    new Set(),
  );

  const {
    data: sampleRows,
    isLoading: isLoadingSampleRows,
    error: errorSampleRows,
  } = useFetchSampleRows({
    source_name,
    version,
  });
  const { promoted = [] } = sampleRows || {};
  const promotedOnSchemaFieldsSet = useMemo(() => {
    return new Set(promoted.map((promoted) => promoted.key));
  }, [promoted]);

  const handleAddPromoteField = useCallback((fieldPath: string) => {
    setFieldsToPromote(
      (prev) => new Set([...prev, fieldPath.replace('_json.', '')]),
    );
  }, []);

  const handleRemovePromoteField = useCallback((fieldPath: string) => {
    setFieldsToPromote((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fieldPath.replace('_json.', ''));
      return newSet;
    });
  }, []);

  const handleClearFieldsToPromote = useCallback(() => {
    setFieldsToPromote(new Set());
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
      handleClearFieldsToPromote,
      isFieldPromoted,
      sampleRows,
      isLoadingSampleRows,
      errorSampleRows,
      promotedOnSchemaFieldsSet,
    }),
    [
      fieldsToPromote,
      handleAddPromoteField,
      handleRemovePromoteField,
      handleClearFieldsToPromote,
      isFieldPromoted,
      sampleRows,
      isLoadingSampleRows,
      errorSampleRows,
      promotedOnSchemaFieldsSet,
    ],
  );

  return (
    <PromoteRowsContext.Provider value={value}>
      {children}
    </PromoteRowsContext.Provider>
  );
};
