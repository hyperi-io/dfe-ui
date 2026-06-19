import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { useDevAlert } from '@/core/hooks/useDevAlert';
import { useFetchSampleEvents } from '@/Sources/hooks/useFetchSampleEvents';
import { SourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Alert, Spin } from 'antd';
import { useMemo } from 'react';
import { getSampleEventsTableColumns } from './SampleEventsTabContent.helpers';

export const SampleEventsTabContent = ({
  source_name,
  schema,
}: {
  source_name: string;
  schema: SourceVersionDetail['version']['schema'];
}) => {
  const {
    data: sampleEvents,
    isLoading,
    error,
  } = useFetchSampleEvents({
    source_name,
  });

  const { isDevAlertsEnabled } = useDevAlert();

  const columns = useMemo(
    () => getSampleEventsTableColumns(sampleEvents ?? []),
    [sampleEvents],
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
        <p className="sr-only">Loading events</p>
      </div>
    );
  if (error)
    return (
      <GenericErrorCard
        title="Error fetching sample events"
        description={error.message}
      />
    );

  const isMetaSchemaDefined = !!schema?.meta_schema || !!schema?.derived_schema;

  return (
    <div className="flex flex-col gap-y-4">
      {!isMetaSchemaDefined && (
        <NotificationCard
          icon={<IconInfoCircle className="w-4 h-4" />}
          description={
            <p className="flex gap-2">
              This source has no meta or derived schema defined. Results will
              subsequently be sent to{' '}
              <span className="font-semibold">_default_land.</span>
            </p>
          }
        />
      )}
      {isDevAlertsEnabled && (
        <Alert type="error" title="Dev Alert - Mocked Data" />
      )}
      <Table
        dataSource={sampleEvents}
        columns={columns}
        pagination={false}
        rowKey="_uuid"
      />
    </div>
  );
};
