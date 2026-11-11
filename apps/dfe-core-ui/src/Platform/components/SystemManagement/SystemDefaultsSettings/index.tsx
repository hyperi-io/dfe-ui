import { FormNotification } from '@/core/components/FormNotification';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchDefaults } from '@/core/hooks/useFetchDefaults';
import { Button } from 'antd';
import { useState } from 'react';
import { EditSystemDefaultsForm } from './EditSystemDefaultsForm';
import { SystemDefaultsActionMenu } from './SystemDefaultsActionMenu';
import { ViewSystemDefaults } from './ViewSystemDefaults';

export const SystemDefaultsSettings = () => {
  const { data: defaults, error, isLoading } = useFetchDefaults();

  const [isEditDefaultsOpen, setIsEditDefaultsOpen] = useState(false);
  const [hasDefaultsChanged, setHasDefaultsChanged] = useState(false);

  return (
    <SectionCard
      title="System Defaults"
      rightTitleSlot={
        <SystemDefaultsActionMenu
          onClick={{ onEditDefaultsClick: () => setIsEditDefaultsOpen(true) }}
          isConfigDriftOpen={hasDefaultsChanged}
          onConfigDriftClose={() => setHasDefaultsChanged(false)}
        />
      }
    >
      {isEditDefaultsOpen && !defaults && error ? (
        <div className="flex flex-col gap-2">
          <FormNotification
            type="error"
            text={`The defaults could not be loaded, so they cannot be edited: ${error.message}`}
          />
          <div className="flex justify-end">
            <Button onClick={() => setIsEditDefaultsOpen(false)}>Close</Button>
          </div>
        </div>
      ) : isEditDefaultsOpen && defaults ? (
        <EditSystemDefaultsForm
          onClose={() => setIsEditDefaultsOpen(false)}
          onSuccess={({ changed }) => {
            setIsEditDefaultsOpen(false);
            setHasDefaultsChanged(changed);
          }}
          maxTtlDays={defaults.ttl_days.maximum}
          initialValues={{
            ttl_days: defaults.ttl_days.effective,
            engine: defaults.engine.effective,
            common_header_version: defaults.common_header_version.effective,
            common_header_type: `common-header/${defaults.common_header_type.effective.replace('common-header/', '')}`,
          }}
        />
      ) : (
        <ViewSystemDefaults
          defaults={defaults}
          error={error}
          isLoading={isLoading}
        />
      )}
    </SectionCard>
  );
};
