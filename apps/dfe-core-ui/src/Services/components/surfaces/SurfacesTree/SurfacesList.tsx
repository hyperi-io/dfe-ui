import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { cn } from '@/core/utils/style';
import { useListSurfacesContext } from '@/Services/contexts/ListSurfacesContext';
import { TServiceSurfaceSummaryItem } from '@/Services/hooks/serviceSurfaces/useFetchServiceSurfaces/types';
import { Spin } from 'antd';
import { EmptyList } from './EmptyList';
import { ErrorList } from './ErrorList';

export const SurfacesList = ({ className }: { className?: string }) => {
  const {
    data: surfaces,
    isLoading,
    error,
    selectedService,
    setSelectedService,
  } = useListSurfacesContext();

  const { componentHeight } = useSetComponentHeight({
    offset: 100,
  });

  if (surfaces.length === 0) {
    return <EmptyList className={className} />;
  }

  if (error) {
    return <ErrorList className={className} message={error.message} />;
  }

  if (isLoading) {
    return (
      <>
        <Spin /> <span className="sr-only">Loading surfaces...</span>
      </>
    );
  }

  return (
    <CustomScrollbar height={componentHeight}>
      <ul className={cn('flex flex-col gap-2 pt-2', className)}>
        <>
          {surfaces.map((surface: TServiceSurfaceSummaryItem) => {
            const isSelected = selectedService === surface.service;
            return (
              <li key={surface.service} className="w-full">
                <div className="flex items-center gap-2">
                  <button
                    className={cn(
                      'overflow-hidden',
                      'hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left items-center flex [&_span]:w-full px-2 py-0.5 hover:cursor-pointer rounded-md',
                      isSelected && 'bg-gray-200 dark:bg-gray-700',
                    )}
                    onClick={() => {
                      setSelectedService(surface.service);
                    }}
                  >
                    <dl>
                      <dt className="truncate ellipsis">{surface.service}</dt>
                    </dl>
                  </button>
                </div>
              </li>
            );
          })}
        </>
      </ul>
    </CustomScrollbar>
  );
};
