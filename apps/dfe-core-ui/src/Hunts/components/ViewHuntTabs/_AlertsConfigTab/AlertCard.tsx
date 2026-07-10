import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { AlertListResponseItem } from '@/Hunts/hooks/useFetchInfiniteFilteredAlerts/types';
import { IconEdit } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { UpdateAlertForm } from './UpdateAlertForm';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);
export const AlertCard = ({ alert }: { alert: AlertListResponseItem }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="border rounded-lg border-foreground/10 dark:border-dark-foreground/10">
      <SimpleCollapse className="border-none" title={alert.name}>
        {({ setOpen }) => (
          <div className="relative">
            <Button
              className="absolute top-0 right-0"
              type="link"
              icon={<IconEdit />}
              onClick={() => setIsEditing(!isEditing)}
            />

            {isEditing && (
              <UpdateAlertForm
                onFinish={() => {
                  setOpen(false);
                }}
                alert={alert}
              />
            )}
            {!isEditing && (
              <dl className="grid grid-cols-[140px_1fr_140px_1fr] gap-x-6 gap-y-1">
                <dt className={dataListTermStyle}>Name:</dt>
                <dd>{alert.name || <EmptyData />}</dd>
                <dt className={dataListTermStyle}>URL Scheme:</dt>
                <dd>{alert.url_scheme || <EmptyData />}</dd>
                <dt className={dataListTermStyle}>Description:</dt>
                <dd>{alert.description || <EmptyData />}</dd>
                <dt className={dataListTermStyle}>Enabled:</dt>
                <dd>{alert.enabled ? 'Enabled' : 'Disabled'}</dd>
              </dl>
            )}
          </div>
        )}
      </SimpleCollapse>
    </div>
  );
};
