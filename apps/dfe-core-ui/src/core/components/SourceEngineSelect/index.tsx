import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { TableEngineInput } from '@/core/components/TableEngineSelect';
import { useFetchTableEngines } from '@/core/hooks/useFetchTableEngines';
import { SelectProps } from 'antd';

export const SourceEngineSelect = ({ className }: SelectProps) => {
  const { data: { items: engines } = {}, isLoading: isLoadingEngines } =
    useFetchTableEngines();

  return (
    <RbacProtected action={RbacProtected.rbacActions.source_read}>
      <RbacProtected.Unrestricted>
        <TableEngineInput
          size="small"
          className={className}
          engines={engines ?? []}
          loading={isLoadingEngines}
        />
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted>
        <NotificationCard
          className="w-full"
          title="You do not have sufficient permissions"
          description="Please contact your administrator to request access."
        />
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
