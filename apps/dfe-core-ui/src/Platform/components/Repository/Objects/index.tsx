import { NotificationCard } from '@/core/components/NotificationCard';
import { SectionCard } from '@/core/components/SectionCard';

export const RepositoryObjects = () => {
  // TODO: Implement repository objects
  return (
    <SectionCard title="Repository Objects">
      <NotificationCard
        type="error"
        title="Error fetching repository objects"
      />
    </SectionCard>
  );
};
