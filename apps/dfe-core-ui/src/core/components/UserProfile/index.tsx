import { SectionCard } from '@/core/components/SectionCard';
import { useParams } from 'next/navigation';
import { ResetPasswordDrawer } from './ResetPasswordDrawer';
import { UpdateProfileDrawer } from './UpdateProfileDrawer';

export const UserProfile = () => {
  const params = useParams();
  const resetPassword = params.reset_password === 'true';
  return (
    <>
      <SectionCard
        title="Reset Password"
        description="Reset your user account password"
        rightTitleSlot={<ResetPasswordDrawer open={resetPassword} />}
      />

      <SectionCard
        title="Profile Information"
        description="View and manage your user account information"
        rightTitleSlot={<UpdateProfileDrawer />}
      />
    </>
  );
};
