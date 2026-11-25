import { isOidcProviderType } from '@/core/helpers/oidcProviderFieldRules';
import { IconKey } from '@repo/dfe-icons';

const LETTERS = { entra_id: 'E', google: 'G', okta: 'O' } as const;

const SIZES = {
  default: 'h-4 w-4 text-[10px]',
  large: 'h-12 w-12 text-base',
  small: 'h-3.5 w-3.5 text-[9px]',
} as const;

interface ProviderBadgeProps {
  /** The provider's type as the engine reports it: generic, empty or unknown draws a key. */
  type: string;
  /** Without one the badge is hidden from assistive tech, for a badge beside its provider's name. */
  label?: string;
  size?: keyof typeof SIZES;
}

/** A filled circle naming an OIDC provider type by its initial, in the console's colours rather than the vendor's mark. */
export const ProviderBadge = ({
  label,
  size = 'default',
  type,
}: ProviderBadgeProps) => {
  const a11y = label
    ? { 'aria-label': label, role: 'img' }
    : { 'aria-hidden': true };
  const letter =
    isOidcProviderType(type) && type !== 'generic' ? LETTERS[type] : undefined;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-foreground/60 font-semibold leading-none text-background dark:bg-dark-foreground/60 dark:text-dark-background ${SIZES[size]}`}
      {...a11y}
    >
      {letter ?? <IconKey aria-hidden className="h-2/3 w-2/3" />}
    </span>
  );
};
