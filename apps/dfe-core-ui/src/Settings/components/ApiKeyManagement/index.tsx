import { SectionCard } from '@/core/components/SectionCard';
import { CreateApiKeyDrawer } from './CreateApiKeyDrawer';

export const ApiKeyManagement = () => {
  return (
    <>
      <SectionCard
        title="Create a new API key linked to groups or scopes"
        rightTitleSlot={<CreateApiKeyDrawer />}
      />
    </>
  );
};
