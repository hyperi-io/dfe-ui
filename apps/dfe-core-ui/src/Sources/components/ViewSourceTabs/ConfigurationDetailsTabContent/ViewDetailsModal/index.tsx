import { cn } from '@/core/utils/style';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { IconEye } from '@repo/dfe-icons';
import { Button, Modal } from 'antd';
import { useState } from 'react';

type TView = NonNullable<TSourceVersionDetail['version']['views']>[number];

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);
export const ViewDetailsModal = ({
  view: { standard, field_map, custom_mappings, taxonomy, category, service },
}: {
  view: TView;
}) => {
  const [open, setOpen] = useState(false);

  const hasCustomMappings = Object.keys(custom_mappings || {}).length > 0;

  return (
    <>
      <Button
        size="small"
        type="text"
        htmlType="button"
        icon={<IconEye />}
        onClick={() => setOpen(true)}
      />
      <Modal
        title={standard}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <dl className="grid grid-cols-[155px_1fr] gap-x-6 gap-y-1">
          <dt className={dataListTermStyle}>Field Map:</dt>
          <dd>{field_map || <EmptyData />}</dd>
          <dt className={dataListTermStyle}>Taxonomy:</dt>
          <dd>{taxonomy || <EmptyData />}</dd>
          <dt className={dataListTermStyle}>Category:</dt>
          <dd>{category || <EmptyData />}</dd>
          <dt className={dataListTermStyle}>Service:</dt>
          <dd>{service || <EmptyData />}</dd>
          <dt
            className={cn(dataListTermStyle, hasCustomMappings && 'col-span-2')}
          >
            Custom Mappings:
          </dt>

          <dd className={cn(hasCustomMappings && 'col-span-2')}>
            {hasCustomMappings ? (
              <pre className="bg-foreground/10 dark:bg-dark-foreground/10 rounded-md p-2 w-full shadow-inner border border-foreground/10 dark:border-dark-foreground/10">
                {Object.entries(custom_mappings || {})
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(',\n')}
              </pre>
            ) : (
              <EmptyData />
            )}
          </dd>
        </dl>
      </Modal>
    </>
  );
};
