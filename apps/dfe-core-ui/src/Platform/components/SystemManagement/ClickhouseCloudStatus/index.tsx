import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchSystemClickhouseStatus } from '@/Platform/hooks/system/useFetchSystemClickhouseStatus';
import { IconCircleCheck, IconCircleX, IconInfoCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';
import { StartStopClickhouseButton } from './StartStopClickhouseButton';

export const ClickhouseCloudStatus = () => {
  const {
    data: clickhouseStatus,
    isLoading: isClickhouseStatusLoading,
    error: clickhouseStatusError,
  } = useFetchSystemClickhouseStatus();

  return (
    <SectionCard
      // Named for what it reads: /system/clickhouse-cloud says nothing about the
      // ClickHouse the stack is running against.
      title="ClickHouse Cloud"
      rightTitleSlot={
        clickhouseStatus?.configured ? (
          <StartStopClickhouseButton
            state={clickhouseStatus?.is_running ? 'stop' : 'start'}
          />
        ) : null
      }
    >
      <RbacProtected action={RbacProtected.rbacActions.system_read}>
        <RbacProtected.Unrestricted>
          {isClickhouseStatusLoading && (
            <>
              <Spin />{' '}
              <span className="sr-only">Loading clickhouse status</span>
            </>
          )}
          {clickhouseStatusError && (
            <NotificationCard
              title="Error"
              description={clickhouseStatusError.message}
              type="error"
            />
          )}
          {clickhouseStatus && (
            <>
              <dl className="grid grid-cols-[auto_1fr_auto_1fr] gap-2">
                <dt>Configured:</dt>
                <dd>
                  {clickhouseStatus.configured ? (
                    <span className="flex items-center gap-2">
                      <IconCircleCheck className="text-green-500 text-base" />{' '}
                      Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <IconCircleX className="text-red-500 text-base" /> No
                    </span>
                  )}
                </dd>

                <dt>Is Running:</dt>
                <dd>
                  {clickhouseStatus.is_running ? (
                    <span className="flex items-center gap-2">
                      <IconCircleCheck className="text-green-500 text-base" />{' '}
                      Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <IconCircleX className="text-red-500 text-base" /> No
                    </span>
                  )}
                </dd>
                {clickhouseStatus.id && (
                  <>
                    <dt>ID:</dt>
                    <dd>{clickhouseStatus.id}</dd>
                  </>
                )}
                {clickhouseStatus.name && (
                  <>
                    <dt>Name:</dt>
                    <dd>{clickhouseStatus.name}</dd>
                  </>
                )}
                {clickhouseStatus.state && (
                  <>
                    <dt>State:</dt>
                    <dd>{clickhouseStatus.state}</dd>
                  </>
                )}
              </dl>
              {!clickhouseStatus.configured && (
                <NotificationCard
                  icon={<IconInfoCircle />}
                  description="ClickHouse Cloud isn't configured. This doesn't affect a self-hosted ClickHouse."
                  type="default"
                />
              )}
            </>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
};
