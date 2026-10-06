import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';
import { FieldPromoteBanner } from './FieldPromoteBanner';
import { SampleRowsCard } from './SampleRowsCard';

export const SampleEventsTabContent = () => {
  const { isMetaSchemaDefined, isMainSource, canPromoteFields } =
    useSourceDetailsContext();

  const { sampleRows, isLoadingSampleRows, errorSampleRows } =
    usePromoteRowsContext();

  const { fieldsToPromote } = usePromoteRowsContext();

  const { componentHeight } = useSetComponentHeight({
    offset: 200,
  });

  if (isLoadingSampleRows) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
        <p className="sr-only">Loading events</p>
      </div>
    );
  }
  if (errorSampleRows) {
    return (
      <GenericErrorCard
        title="Error fetching sample events"
        description={errorSampleRows.message}
      />
    );
  }

  return (
    <>
      {canPromoteFields && fieldsToPromote.size > 0 && (
        <div className="relative mb-4">
          <FieldPromoteBanner
            classNames={{
              root: 'sticky w-full top-0 left-0',
            }}
          />
        </div>
      )}
      <div className="flex flex-col gap-y-3">
        {sampleRows?.rows.length === 0 && (
          <NotificationCard
            title="No sample events"
            description="No records match this source yet."
          />
        )}

        {!isMetaSchemaDefined && (
          <NotificationCard
            icon={<IconInfoCircle className="w-4 h-4" />}
            description={
              <p className="flex gap-2">
                {isMainSource
                  ? 'Source is sampled from'
                  : 'This source has no meta schema defined. Results will be sent to'}
                <span className="font-semibold">
                  {sampleRows?.table ?? 'the shared main table'}.
                </span>
              </p>
            }
          />
        )}

        <CustomScrollbar height={componentHeight}>
          <ul className="flex flex-col gap-y-3 mt-2 mb-24">
            {sampleRows?.rows.map((row) => (
              <li key={row._uuid as string}>
                <SampleRowsCard row={row} />
              </li>
            ))}
          </ul>
        </CustomScrollbar>
      </div>
    </>
  );
};
