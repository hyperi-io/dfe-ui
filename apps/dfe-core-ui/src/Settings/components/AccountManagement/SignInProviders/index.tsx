import { ProviderBadge } from '@/Settings/components/AccountManagement/ProviderBadge';
import { Tooltip } from '@/core/components/Tooltip';
import {
  signInProviders,
  type TSignInAccount,
} from '@/Settings/helpers/accountManagementHelpers/signInProviders';

/** A badge for each OIDC provider that reaches the account, and nothing for one only its password reaches. */
export const SignInProviders = ({ account }: { account: TSignInAccount }) => {
  const providers = signInProviders(account);
  if (!providers.length) {
    return null;
  }
  return (
    <ul className="flex items-center gap-1">
      {providers.map(({ name, type }) => (
        <li key={name} className="flex">
          <Tooltip destroyOnHidden title={name}>
            <span className="flex">
              <ProviderBadge label={`Signs in through ${name}`} type={type} />
            </span>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
};
