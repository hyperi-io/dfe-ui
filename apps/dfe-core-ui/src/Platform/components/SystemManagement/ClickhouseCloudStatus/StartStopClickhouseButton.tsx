import { RbacProtected } from '@/core/components/RbacProtected';
import { Tooltip } from '@/core/components/Tooltip';
import { useSystemStopStartClickhouseCloud } from '@/Platform/hooks/system/useSystemStopStartClickhouseCloud';
import { IconPlayerPlay, IconPlayerStop } from '@repo/dfe-icons';
import { Button } from 'antd';

export const StartStopClickhouseButton = ({
  state,
}: {
  state: 'start' | 'stop';
}) => {
  const {
    mutate: stopStartClickhouseCloud,
    error: stopStartClickhouseCloudError,
    isPending: isStopStartClickhouseCloudPending,
  } = useSystemStopStartClickhouseCloud();

  return (
    <RbacProtected action={RbacProtected.rbacActions.system_read}>
      <RbacProtected.Unrestricted>
        {stopStartClickhouseCloudError ? (
          <Tooltip
            destroyOnHidden
            title={stopStartClickhouseCloudError.message}
          >
            <Button danger>Clickhouse Cloud Error</Button>
          </Tooltip>
        ) : (
          <Button
            classNames={{
              content: 'flex items-center gap-2',
            }}
            onClick={() =>
              stopStartClickhouseCloud(state === 'start' ? 'stop' : 'start')
            }
            loading={isStopStartClickhouseCloudPending}
          >
            {!isStopStartClickhouseCloudPending && state === 'start' ? (
              <>
                Start Clickhouse Cloud <IconPlayerPlay />
              </>
            ) : (
              <>
                Stop Clickhouse Cloud <IconPlayerStop />
              </>
            )}
          </Button>
        )}
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Button icon={<IconPlayerPlay />} disabled>
          Start/Stop Clickhouse Cloud
        </Button>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
