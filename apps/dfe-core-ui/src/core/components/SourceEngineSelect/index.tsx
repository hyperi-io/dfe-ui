import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchTableEngines } from '@/core/hooks/useFetchTableEngines';
import { cn } from '@/core/utils/style';
import { Select, SelectProps } from 'antd';
import { useMemo } from 'react';

export const SourceEngineSelect = ({ className, ...props }: SelectProps) => {
  const { data: { items: engines } = {}, isLoading } = useFetchTableEngines();

  const options = useMemo(
    () =>
      engines?.map((engine) => ({
        label: engine.name,
        value: engine.name,
      })),
    [engines],
  );
  return (
    <RbacProtected action={RbacProtected.rbacActions.source_read}>
      <RbacProtected.Unrestricted>
        <Select
          className={cn(className, 'min-w-60')}
          options={options}
          loading={isLoading}
          {...props}
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
