import { GenericErrorCard } from '@/core/components/GenericError';
import { Table } from '@/core/components/Table';
import { useDevAlert } from '@/core/hooks/useDevAlert';
import { useFetchSampleEvents } from '@/Sources/hooks/useFetchSampleEvents';
import { Alert, Spin } from 'antd';
import { useMemo } from 'react';
import { getSampleEventsTableColumns } from './SampleEventsTabContent.helpers';

export const SampleEventsTabContent = ({ source }: { source: string }) => {
  const {
    data: sampleEvents,
    isLoading,
    error,
  } = useFetchSampleEvents({
    source_name: source,
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

  return (
    <>
      {isDevAlertsEnabled && (
        <Alert className="mb-4" type="error" title="Dev Alert - Mocked Data" />
      )}
      <Table
        dataSource={sampleEvents}
        columns={columns}
        pagination={false}
        rowKey="_uuid"
      />
    </>
  );
};
