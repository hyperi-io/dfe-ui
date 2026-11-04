'use client';

import { TSourceVersionDetail } from '@/core/config/api/sources.types';

import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { $api, asApiError } from '@/core/config/api';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface SourceDetailsContextValue {
  sourceDetail: TSourceVersionDetail | undefined;
  isLoadingSourceDetail: boolean;
  errorSourceDetail: Error | null | undefined;
  isMetaSchemaDefined: boolean;
  isMainSource: boolean;
  originType: 'fetcher' | 'receiver' | 'external' | undefined | null;
  canPromoteFields: boolean;
  isDeployed: boolean;
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
    isLoading: isFetchingSourceDetail,
    error: sourceDetailRefusal,
  } = $api.useQuery(
    'get',
    '/api/v1/sources/{name}/versions/{version}',
    {
      params: {
        path: {
          name: selectedSourceName ?? '',
          version: selectedSourceVersion ?? '',
        },
      },
    },
    { enabled: !!selectedSourceName && !!selectedSourceVersion },
  );

  const errorSourceDetail = asApiError(sourceDetailRefusal);

  // No version yet means the list is still loading, and the detail cannot be asked for until it names one.
  const isLoadingSourceDetail =
    isFetchingSourceDetail || selectedSourceVersion === null;

  const isMetaSchemaDefined = useMemo(() => {
    return (
      sourceDetail?.version?.schema?.meta_schema !== null &&
      sourceDetail?.version?.schema?.meta_schema !== undefined
    );
  }, [sourceDetail]);

  const originType = useMemo(() => {
    return sourceDetail?.version?.origin;
  }, [sourceDetail]);

  // The engine refuses promote-field on a core source, and main is the core landing source.
  const canPromoteFields =
    !isMainSource && sourceDetail?.resource_type !== RESOURCE_TYPES.CORE;

  const isDeployed = sourceDetail?.deployed_version !== null;

  const value = useMemo<SourceDetailsContextValue>(
    () => ({
      isDeployed,
      canPromoteFields,
      originType,
      sourceDetail,
      isLoadingSourceDetail,
      errorSourceDetail,
      isMetaSchemaDefined,
      isMainSource,
    }),
    [
      isDeployed,
      canPromoteFields,
      originType,
      sourceDetail,
      isLoadingSourceDetail,
      errorSourceDetail,
      isMetaSchemaDefined,
      isMainSource,
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
