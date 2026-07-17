import { useFetchFieldMapDetail } from '@/core/hooks/useFetchFieldMapDetail';
import { cn } from '@/core/utils/style';
import { IconArrowRight } from '@repo/dfe-icons';

const EmptyData = (label: string) => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">
    {label || 'N/A'}
  </span>
);
const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';

export const MappingStandardsDetail = ({
  mappingStandard,
}: {
  mappingStandard: string;
}) => {
  const [standard, source] = mappingStandard.split(':');
  const { data: mappingStandardData } = useFetchFieldMapDetail({
    standard,
    source,
  });
  return (
    <div
      className={cn(
        'flex flex-col gap-y-2',
        'max-h-[400px] overflow-y-auto css-custom-scrollbar',
      )}
    >
      <dl className={cn('grid grid-cols-[155px_1fr] gap-x-6 gap-y-1')}>
        <dt className={dataListTermStyle}>Standard:</dt>
        <dd>{mappingStandardData?.standard}</dd>
        <dt className={dataListTermStyle}>Source:</dt>
        <dd>{mappingStandardData?.source || EmptyData('_default')}</dd>
        <dt className={dataListTermStyle}>Description:</dt>
        <dd>{mappingStandardData?.description || EmptyData('None')}</dd>
        <dt className={dataListTermStyle}>Version:</dt>
        <dd>{mappingStandardData?.version || EmptyData('None')}</dd>
        <dt className={dataListTermStyle}>Inherits:</dt>
        <dd>{mappingStandardData?.inherits || EmptyData('None')}</dd>
      </dl>
      <p className="font-medium mt-1">Mappings:</p>
      <ul className={cn('grid grid-cols-2 gap-y-1')}>
        {Object.entries(mappingStandardData?.mappings ?? {}).length > 0
          ? Object.entries(mappingStandardData?.mappings ?? {}).map(
              ([key, value]) => (
                <li className="flex items-center gap-x-1" key={key}>
                  {key} <IconArrowRight />
                  {value}
                </li>
              ),
            )
          : EmptyData('None')}
      </ul>
    </div>
  );
};
