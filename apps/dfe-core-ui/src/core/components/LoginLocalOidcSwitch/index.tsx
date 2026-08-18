import { LocalLoginForm } from './LocalLoginForm';

export const LoginLocalOidcSwitch = ({
  callbackUrl,
}: {
  callbackUrl: string;
}) => {
  return (
    <div className="w-full">
      <LocalLoginForm callbackUrl={callbackUrl} />
    </div>
  );
};
