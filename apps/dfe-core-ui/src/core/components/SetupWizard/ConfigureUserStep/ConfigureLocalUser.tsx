import { CreateAccountForm } from '@/core/components/CreateAccountForm';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useSetupWizardParams } from '@/core/components/SetupWizard/helpers';
import { useCreateAccount } from '@/core/hooks/useCreateAccount';

export const ConfigureLocalUser = () => {
  const {
    params: { username },
    setParams,
  } = useSetupWizardParams();

  const {
    mutate: createAccount,
    isPending,
    error,
  } = useCreateAccount({
    onSuccess: ({ username }) => {
      setParams({ username });
    },
  });

  return username ? (
    <NotificationCard
      title="Account Created"
      description="Your account has been created successfully."
      type="success"
    />
  ) : (
    <CreateAccountForm
      onFinish={createAccount}
      error={error}
      isPending={isPending}
      initialValues={{ username: '', password: '', groups: ['dfe-admins'] }}
      disabledFields={{ groups: true }}
    />
  );
};
