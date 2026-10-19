import { SectionCard } from '@/core/components/SectionCard';
import { useFetchDefaults } from '@/core/hooks/useFetchDefaults';
import { useState } from 'react';
import { EditSystemDefaultsForm } from './EditSystemDefaultsForm';
import { SystemDefaultsActionMenu } from './SystemDefaultsActionMenu';
import { ViewSystemDefaults } from './ViewSystemDefaults';

export const SystemDefaultsSettings = () => {
  const { data: defaults, error } = useFetchDefaults();

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
      {isEditDefaultsOpen ? (
        <EditSystemDefaultsForm
          onClose={() => setIsEditDefaultsOpen(false)}
          onSuccess={({ changed }) => {
            setIsEditDefaultsOpen(false);
            setHasDefaultsChanged(changed);
          }}
          initialValues={{
            ttl_days: defaults?.ttl_days?.effective ?? 0,
            engine: defaults?.engine?.effective ?? '',
            common_header_version:
              defaults?.common_header_version?.effective ?? '',
            common_header_type: `common-header/${defaults?.common_header_type?.effective?.replace('common-header/', '')}`,
          }}
        />
      ) : (
        <ViewSystemDefaults defaults={defaults} error={error} />
      )}
    </SectionCard>
  );
};
