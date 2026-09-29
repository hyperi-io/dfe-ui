'use client';

import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';

import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface SourceDetailsContextValue {
  sourceDetail: TSourceVersionDetail | undefined;
  isLoadingSourceDetail: boolean;
  errorSourceDetail: Error | null | undefined;
  isMetaSchemaDefined: boolean;
  isMainSource: boolean;
  canPromoteFields: boolean;
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

  const isMainSource = useMemo(() => {
    return selectedSourceName === 'main';
  }, [selectedSourceName]);

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

  // The engine refuses promote-field on a core source, and main is the core landing source.
  const canPromoteFields =
    !isMainSource && sourceDetail?.resource_type !== RESOURCE_TYPES.CORE;

  const value = useMemo<SourceDetailsContextValue>(
    () => ({
      sourceDetail,
      isLoadingSourceDetail,
      errorSourceDetail,
      isMetaSchemaDefined,
      isMainSource,
      canPromoteFields,
    }),
    [
      sourceDetail,
      isLoadingSourceDetail,
      errorSourceDetail,
      isMetaSchemaDefined,
      isMainSource,
      canPromoteFields,
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
