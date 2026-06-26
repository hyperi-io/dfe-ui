import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchSampleRows } from '@/Sources/hooks/useFetchSampleRows';
import { SourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { IconAlertCircle, IconInfoCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';
import { SampleRowsCard } from './SampleRowsCard';

export const SampleEventsTabContent = ({
  source,
  version,
}: {
  source: SourceVersionDetail;
  version: string;
}) => {
  const { version: { schema } = {} } = source;
  const isMetaSchemaDefined = !!schema?.meta_schema || !!schema?.derived_schema;
  const isDeployedVersion = version === source.deployed_version;
  const canViewSampleRows = !isMetaSchemaDefined || isDeployedVersion;

  const {
    data: sampleRows,
    isLoading,
    error,
  } = useFetchSampleRows({
    source_name: source.source,
    version,
    queryEnabled: canViewSampleRows,
  });

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
    <div className="flex flex-col gap-y-4">
      {!isMetaSchemaDefined && (
        <NotificationCard
          icon={<IconInfoCircle className="w-4 h-4" />}
          description={
            <p className="flex gap-2">
              This source has no meta or derived schema defined. Results will be
              sent to <span className="font-semibold">_default_land.</span>
            </p>
          }
        />
      )}
      {!canViewSampleRows && (
        <NotificationCard
          type="warning"
          icon={<IconAlertCircle />}
          description="You can only view sample rows for source versions that are sent to _default_land or are deployed."
        />
      )}
      {canViewSampleRows && (
        <ul className="flex flex-col gap-2">
          {sampleRows?.rows.map((row) => (
            <li key={row._uuid as string}>
              <SampleRowsCard row={row} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
