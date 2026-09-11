import { SectionCard } from '@/core/components/SectionCard';
import { ResetPasswordDrawer } from './ResetPasswordDrawer';
import { UpdateProfileDrawer } from './UpdateProfileDrawer';

export const UserProfile = () => {
  return (
    <>
      <SectionCard
        title="Reset Password"
        description="Reset your user account password"
        rightTitleSlot={<ResetPasswordDrawer />}
      />

      <SectionCard
        title="Profile Information"
        description="View and manage your user account information"
        rightTitleSlot={<UpdateProfileDrawer />}
      />
    </>
  );
};
