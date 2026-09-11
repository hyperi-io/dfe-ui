'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { UserAccountToolbar } from '@/core/components/UserAccountToolbar';
import { UserProfile } from '@/core/components/UserProfile';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';

export const UserAccountScene = () => {
  const { data: currentUser } = useFetchCurrentUser();
  return (
    <>
      <UserAccountToolbar
        name={currentUser?.name || currentUser?.username || 'Unknown'}
      />
      <MainContentCard>
        <UserProfile />
      </MainContentCard>
    </>
  );
};
