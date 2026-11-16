import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { HuntStateTag } from '@/Hunts/components/HuntStateTag';
import { ViewHuntDetailTabs } from '@/Hunts/components/ViewHuntTabs';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { useFetchHuntDetail } from '@/Hunts/hooks/useFetchHuntDetail';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { useHuntRunState } from '@/Hunts/hooks/useHuntRunState';
import { useToggleHuntEnabled } from '@/Hunts/hooks/useToggleHuntEnabled';
import { autoDisableNotice } from '@/Hunts/utils/autoDisable';
import { Alert, Button, Spin } from 'antd';
import { HuntDetailActionMenu } from './HuntDetailActionMenu';
import { TriggerHunt } from './TriggerHunt';

const HuntDetailStateTag = ({ hunt }: { hunt: THuntDetailResponse }) => {
  const state = useHuntRunState(hunt);
  return <HuntStateTag {...state} />;
};

/** The way back, in the alert itself rather than only behind the actions menu. */
const ReenableHuntButton = ({ hunt }: { hunt: THuntDetailResponse }) => {
  const { label, loading, toggle } = useToggleHuntEnabled({ hunt });
  return (
    <RbacProtected action={RbacProtected.rbacActions.hunt_write}>
      <RbacProtected.Unrestricted>
        <Button size="small" loading={loading} onClick={toggle}>
          {label}
        </Button>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Button size="small" disabled>
          {label}
        </Button>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};

/** The auto-disable and the way back as text, because the tag's tooltip is hover only. */
const HuntStopAlert = ({ hunt }: { hunt: THuntDetailResponse }) => {
  const { autoDisabledAt, autoDisabledReason } = useHuntRunState(hunt);
  if (autoDisabledAt == null) {
    return null;
  }
  return (
    <Alert
      type="warning"
      showIcon
      title={autoDisableNotice(autoDisabledAt, autoDisabledReason)}
      description="It fires nothing until it is re-enabled."
      action={<ReenableHuntButton hunt={hunt} />}
    />
  );
};

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
          <HuntDetailStateTag hunt={huntDetail} />
        </h4>
        <div className="flex items-center gap-x-2">
          <TriggerHunt hunt={huntDetail} />
          <HuntDetailActionMenu hunt={huntDetail} />
        </div>
      </div>

      <HuntStopAlert hunt={huntDetail} />

      <ViewHuntDetailTabs selectedHuntName={selectedHuntName} {...huntDetail} />
    </CustomScrollbar>
  );
};
