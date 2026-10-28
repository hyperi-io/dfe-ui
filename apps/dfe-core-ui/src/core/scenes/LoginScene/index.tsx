'use client';

import { LoginLocalOidcSwitch } from '@/core/components/LoginLocalOidcSwitch';
import { type TLoginRefusal } from '@/core/config/loginRefusal';
import { loginNotice } from '@/core/config/loginNotice';
import { cn } from '@/core/utils/style';
import { IconPrimaryLogoFull } from '@repo/dfe-icons';
import { Alert } from 'antd';
import './Login.css';

const Login = ({
  callbackUrl,
  notice,
  failure,
}: {
  callbackUrl: string;
  notice?: string;
  failure?: TLoginRefusal;
}) => {
  const shown = loginNotice(notice);
  return (
    <main
      className={cn(
        'h-screen w-full flex flex-col items-center justify-center',
        'bg-tertiary bg-linear-to-r from-tertiary via-secondary to-brand-primary bg-size-[200%_200%]',
      )}
      style={{
        animation: 'gradient 20s ease infinite',
      }}
    >
      <div className="bg-background dark:bg-dark-background rounded-lg p-4 shadow-lg text-foreground dark:text-dark-foreground min-w-96 max-w-md flex flex-col items-center gap-4">
        <IconPrimaryLogoFull
          className={cn('m-auto', 'text-brand-primary dark:text-white')}
          height={30}
          width={150}
        />
        {failure && (
          <Alert
            className="w-full"
            type="error"
            showIcon
            title={failure.title}
            description={failure.description}
          />
        )}
        {shown && (
          <Alert
            className="w-full"
            type="success"
            showIcon
            title={shown.title}
            description={shown.description}
          />
        )}
        <LoginLocalOidcSwitch callbackUrl={callbackUrl} className="min-h-45" />
      </div>
    </main>
  );
};

export const LoginScene = ({
  callbackUrl = '/',
  notice,
  failure,
}: {
  callbackUrl?: string;
  /** A LOGIN_NOTICE_PARAM value; anything unknown shows nothing. */
  notice?: string;
  /** Why the last sign-in did not complete, shown above the form so the user can try again. */
  failure?: TLoginRefusal;
}) => {
  return <Login callbackUrl={callbackUrl} notice={notice} failure={failure} />;
};
