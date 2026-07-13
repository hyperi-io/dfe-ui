'use client';

import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';

import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface SourceDetailsContextValue {
  sourceDetail: TSourceVersionDetail | undefined;
  isLoadingSourceDetail: boolean;
  errorSourceDetail: Error | null | undefined;
  isMetaSchemaDefined: boolean;
}

const SourceDetailsContext = createContext<SourceDetailsContextValue | null>(
  null,
);

export interface SourceDetailsProviderProps {
  children: ReactNode;
}

export const SourceDetailsProvider = ({
  children,
}: SourceDetailsProviderProps) => {
  const { selectedSourceName, selectedSourceVersion } = useListSourcesContext();

  const {
    data: sourceDetail,
    isLoading: isLoadingSourceDetail,
    error: errorSourceDetail,
  } = useFetchSourceDetail({
    source_name: selectedSourceName,
    source_version: selectedSourceVersion,
  });

  const isMetaSchemaDefined = useMemo(() => {
    return (
      sourceDetail?.version?.schema?.meta_schema !== null &&
      sourceDetail?.version?.schema?.meta_schema !== undefined
    );
  }, [sourceDetail]);

  const value = useMemo<SourceDetailsContextValue>(
    () => ({
      sourceDetail,
      isLoadingSourceDetail,
      errorSourceDetail,
      isMetaSchemaDefined,
    }),
    [
      sourceDetail,
      isLoadingSourceDetail,
      errorSourceDetail,
      isMetaSchemaDefined,
    ],
  );

  return (
    <SourceDetailsContext.Provider value={value}>
      {children}
    </SourceDetailsContext.Provider>
  );
};

export const useSourceDetailsContext = () => {
  const context = useContext(SourceDetailsContext);
  if (!context) {
    throw new Error(
      'useSourceDetailsContext must be used within a SourceDetailsProvider',
    );
  }
  return context;
};
