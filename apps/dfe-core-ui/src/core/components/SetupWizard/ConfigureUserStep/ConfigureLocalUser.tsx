import {
  CreateAccountForm,
  CreateAccountFormData,
} from '@/core/components/CreateAccountForm';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useCreateAccount } from '@/core/hooks/useCreateAccount';
import { useLogin } from '@/core/hooks/useLogin';
import { Spin } from 'antd';
import { useState } from 'react';

export const ConfigureLocalUser = ({ goNext }: { goNext: () => void }) => {
  const [loginValues, setLoginValues] = useState<{
    username: string;
    password: string;
  }>({ username: '', password: '' });
  const {
    mutate: login,
    isPending: isLoginPending,
    error: loginError,
  } = useLogin({
    redirectOnSuccess: false,
    onSuccess: () => {
      goNext();
    },
  });

  const {
    mutate: createAccount,
    isPending: isCreateAccountPending,
    error: createAccountError,
  } = useCreateAccount({
    onSuccess: () => {
      login(loginValues);
    },
  });

  const handleFinish = (values: CreateAccountFormData) => {
    setLoginValues({ username: values.username, password: values.password });
    createAccount({
      ...values,
      email: '',
      phone: '',
      name: '',
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <CreateAccountForm
        onFinish={handleFinish}
        error={createAccountError}
        isPending={isCreateAccountPending}
        initialValues={{ username: '', password: '', groups: ['dfe-admins'] }}
        disabledFields={{ groups: true }}
      />

      {isLoginPending && (
        <span className="flex justify-center items-center gap-2">
          <Spin /> We&apos;re busy logging you in...
        </span>
      )}

      {loginError && (
        <NotificationCard
          title="Unexpected Error Occurred"
          description="We were unable to log you in."
          type="error"
        />
      )}
    </div>
  );
};
