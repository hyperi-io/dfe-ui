import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';
import { FieldPromoteBanner } from './FieldPromoteBanner';
import { SampleRowsCard } from './SampleRowsCard';

export const SampleEventsTabContent = ({
  source,
  version,
}: {
  source: TSourceVersionDetail;
  version: string;
}) => {
  const { isMetaSchemaDefined } = useSourceDetailsContext();

  const { sampleRows, isLoadingSampleRows, errorSampleRows } =
    usePromoteRowsContext();

  const { fieldsToPromote } = usePromoteRowsContext();

  if (isLoadingSampleRows)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
        <p className="sr-only">Loading events</p>
      </div>
    );
  if (errorSampleRows)
    return (
      <GenericErrorCard
        title="Error fetching sample events"
        description={errorSampleRows.message}
      />
    );

  return (
    <div className="flex flex-col gap-y-3">
      {sampleRows?.rows.length === 0 && (
        <NotificationCard
          title="No fields to promote"
          description="Sample rows have been analysed and no fields were found for promotion."
        />
      )}
      {fieldsToPromote.size > 0 && (
        <FieldPromoteBanner
          selectedSourceName={source.source}
          selectedSourceVersion={version}
        />
      )}
      {!isMetaSchemaDefined && (
        <NotificationCard
          icon={<IconInfoCircle className="w-4 h-4" />}
          description={
            <p className="flex gap-2">
              This source has no meta schema defined. Results will be sent to{' '}
              <span className="font-semibold">_main_land.</span>
            </p>
          }
        />
      )}

      <ul className="flex flex-col gap-y-3 mt-2">
        {sampleRows?.rows.map((row) => (
          <li key={row._uuid as string}>
            <SampleRowsCard row={row} />
          </li>
        ))}
      </ul>
    </div>
  );
};
