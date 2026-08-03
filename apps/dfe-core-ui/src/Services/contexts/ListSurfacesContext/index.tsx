'use client';

import { useFetchServiceSurfaces } from '@/Services/hooks/serviceSurfaces/useFetchServiceSurfaces';
import { TServiceSurfaceListResponse } from '@/Services/hooks/serviceSurfaces/useFetchServiceSurfaces/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ListSurfacesQueryParams {
  service_name?: string;
}

const filtersToSearchString = (f: ListSurfacesQueryParams): string => {
  const params = new URLSearchParams();

  if (f.service_name) params.set('service_name', f.service_name);
  return params.toString();
};

export interface ListSurfacesContextValue {
  data: TServiceSurfaceListResponse;
  isLoading: boolean;
  error: Error | null;
  selectedService: string | null;
  setSelectedService: (service_name: string | null) => void;
}

const ListSurfacesContext = createContext<ListSurfacesContextValue | null>(
  null,
);

export interface ListSurfacesProviderProps {
  children: ReactNode;
}

const DEFAULT_SURFACES_LIST_RESPONSE: TServiceSurfaceListResponse = [];

export const ListSurfacesProvider = ({
  children,
}: ListSurfacesProviderProps) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const service_name = searchParams.get('service_name');
    startTransition(() => setSelectedService(service_name ?? null));
  }, [searchParams]);

  const {
    data = DEFAULT_SURFACES_LIST_RESPONSE,
    isLoading,
    error,
  } = useFetchServiceSurfaces();

  const handleSetSelectedService = useCallback(
    (service_name: string | null) => {
      setSelectedService(service_name);
      const query = filtersToSearchString({
        service_name: service_name ?? '',
      });
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, setSelectedService],
  );

  const value = useMemo<ListSurfacesContextValue>(
    () => ({
      data,
      isLoading,
      error,
      selectedService,
      setSelectedService: handleSetSelectedService,
    }),
    [data, isLoading, error, selectedService, handleSetSelectedService],
  );

  return (
    <ListSurfacesContext.Provider value={value}>
      {children}
    </ListSurfacesContext.Provider>
  );
};

export const useListSurfacesContext = () => {
  const context = useContext(ListSurfacesContext);
  if (!context) {
    throw new Error(
      'useListSurfacesContext must be used within a ListSurfacesProvider',
    );
  }
  return context;
};
