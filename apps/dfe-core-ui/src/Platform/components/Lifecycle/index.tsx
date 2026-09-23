import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Table } from '@/core/components/Table';
import { Tooltip } from '@/core/components/Tooltip';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useFetchLifecycle } from '@/Platform/hooks/lifecycle/useFetchLifecycle';
import { TLifecycleResponse } from '@/Platform/hooks/lifecycle/useFetchLifecycle/types';
import { useUpdateLifecycle } from '@/Platform/hooks/lifecycle/useUpdateLifecycle';
import { TActionTypeOption } from '@/Platform/hooks/lifecycle/useUpdateLifecycle/types';
import {
  IconPin,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconQuestionMark,
} from '@repo/dfe-icons';
import { Button, Spin, Tag } from 'antd';

const getTagColor = (state: string) => {
  switch (state) {
    case 'running':
      return 'green';
    case 'paused':
      return 'blue';
    case 'stopped':
      return 'red';
    case 'pinned':
    default:
      return 'gray';
  }
};

const getTagText = (state: string) => {
  switch (state) {
    case 'running':
      return 'Running';
    case 'paused':
      return 'Paused';
    case 'stopped':
      return 'Stopped';
    case 'pinned':
      return 'Pinned';
    default:
      return 'Unknown';
  }
};

const getTagIcon = (state: string) => {
  switch (state) {
    case 'running':
      return <IconPlayerPlay />;
    case 'paused':
      return <IconPlayerPause />;
    case 'stopped':
      return <IconPlayerStop />;
    case 'pinned':
      return <IconPin />;
    default:
      return <IconQuestionMark />;
  }
};
export const Lifecycle = () => {
  const { data: lifecycle, isLoading, error } = useFetchLifecycle();

  const { mutate: updateLifecycle } = useUpdateLifecycle();

  const handleAction = (values: {
    name: string;
    action: TActionTypeOption;
  }) => {
    updateLifecycle(values);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (state: string, record: TLifecycleResponse[number]) => {
        const pinned = state === 'pinned';
        const running = state === 'running';
        const paused = state === 'paused';
        const stopped = state === 'stopped';

        return (
          <div className="flex items-center w-full gap-2">
            <Tag
              className="flex items-center mr-auto gap-2"
              color={getTagColor(state)}
            >
              {getTagIcon(state)}
              {getTagText(state)}
            </Tag>

            <>
              {!pinned && (
                <div className="flex gap-2">
                  <Tooltip
                    destroyOnHidden
                    title={
                      running ? 'Service is already running' : 'Start Service'
                    }
                  >
                    <Button
                      icon={<IconPlayerPlay />}
                      disabled={running}
                      type={running ? 'primary' : 'default'}
                      onClick={() =>
                        handleAction({ name: record.name, action: 'start' })
                      }
                      size="small"
                    />
                  </Tooltip>

                  <Tooltip
                    destroyOnHidden
                    title={
                      paused ? 'Service is already paused' : 'Pause Service'
                    }
                  >
                    <Button
                      icon={<IconPlayerPause />}
                      type={paused ? 'primary' : 'default'}
                      disabled={paused}
                      size="small"
                      onClick={() =>
                        handleAction({ name: record.name, action: 'pause' })
                      }
                    />
                  </Tooltip>

                  <Tooltip
                    destroyOnHidden
                    title={
                      stopped ? 'Service is already stopped' : 'Stop Service'
                    }
                  >
                    <Button
                      icon={<IconPlayerStop />}
                      type={stopped ? 'primary' : 'default'}
                      danger
                      disabled={stopped}
                      size="small"
                      onClick={() =>
                        handleAction({ name: record.name, action: 'stop' })
                      }
                    />
                  </Tooltip>
                </div>
              )}
            </>
          </div>
        );
      },
    },
  ];

  const { componentHeight } = useSetComponentHeight({
    offset: 210,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-semibold text-lg">Service Lifecycle</h1>
      <RbacProtected action={RbacProtected.rbacActions.lifecycle_read}>
        <RbacProtected.Unrestricted>
          {isLoading && (
            <>
              <Spin /> <span className="sr-only">Loading...</span>
            </>
          )}
          {error && <FormNotification text={error.message} type="error" />}
          {lifecycle && (
            <Table
              rowKey="name"
              scroll={{ y: componentHeight }}
              pagination={false}
              dataSource={lifecycle}
              columns={columns}
            />
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </div>
  );
};
