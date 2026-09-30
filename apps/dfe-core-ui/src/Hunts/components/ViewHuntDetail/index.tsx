import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { ViewHuntDetailTabs } from '@/Hunts/components/ViewHuntTabs';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { useFetchHuntDetail } from '@/Hunts/hooks/useFetchHuntDetail';
import { Spin } from 'antd';
import { HuntDetailActionMenu } from './HuntDetailActionMenu';
import { TriggerHunt } from './TriggerHunt';

export const ViewHuntDetail = () => {
  const { selectedHuntName } = useListHuntsContext();
  const {
    data: huntDetail,
    isLoading,
    error,
  } = useFetchHuntDetail({
    name: selectedHuntName,
  });

  const { componentHeight } = useSetComponentHeight({
    offset: 100,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title="Error fetching hunt detail"
        description={error.message}
      />
    );
  }

  if (!huntDetail) {
    return (
      <EmptyDetail
        title="No hunt selected"
        description="Select a hunt from the list to view its configuration."
      />
    );
  }

  return (
    <CustomScrollbar height={componentHeight} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center w-full gap-2 text-lg font-medium">
          <span className="text-foreground/50 dark:text-dark-foreground/50">
            Hunt Configuration:
          </span>
          {huntDetail.display_name ?? huntDetail.name}
        </h4>
        <div className="flex items-center gap-x-2">
          <TriggerHunt selectedHuntName={selectedHuntName ?? ''} />
          <HuntDetailActionMenu hunt={huntDetail} />
        </div>
      </div>

      <ViewHuntDetailTabs selectedHuntName={selectedHuntName} {...huntDetail} />
    </CustomScrollbar>
  );
};
