import { GenericErrorCard } from '@/core/components/GenericError';
import { RefreshMetricsButton } from '@/Services/components/surfaces/RefreshMetricsButton';
import { useListSurfacesContext } from '@/Services/contexts/ListSurfacesContext';
import { useFetchServiceSurfaceDetail } from '@/Services/hooks/serviceSurfaces/useFetchServiceSurfaceDetail';
import { Spin } from 'antd';
import { EmptyDetail } from './EmptyDetail';
import { ViewSurfaceDetail } from './ViewSurfaceDetail';

export const ListSurfaceDetail = () => {
  const { selectedService } = useListSurfacesContext();

  const {
    data: surfaceDetailData,
    isLoading: isFetchingSurfaceDetail,
    error: fetchSurfaceDetailError,
  } = useFetchServiceSurfaceDetail({
    name: selectedService,
  });

  if (!selectedService) {
    return <EmptyDetail />;
  }

  if (isFetchingSurfaceDetail && !surfaceDetailData)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (fetchSurfaceDetailError)
    return (
      <GenericErrorCard
        title="Error fetching surface detail"
        description={fetchSurfaceDetailError.message}
      />
    );

  if (!surfaceDetailData) {
    return <EmptyDetail />;
  }

  return (
    <>
      <div className="h-[calc(100vh-100px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
        <div className="flex shrink-0 items-center justify-between">
          <h4 className="flex items-center w-full gap-2 text-lg font-medium">
            <span className="text-foreground/50 dark:text-dark-foreground/50">
              Surface:
            </span>
            {selectedService}
          </h4>
          <RefreshMetricsButton serviceName={selectedService} />
        </div>
        <ViewSurfaceDetail {...surfaceDetailData} />
      </div>
    </>
  );
};
