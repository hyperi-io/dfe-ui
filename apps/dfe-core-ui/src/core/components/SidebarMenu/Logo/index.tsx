import { cn } from '@/core/utils/style';
import { IconPrimaryLogoMark } from '@repo/dfe-icons';

import Link from 'next/link';

interface LogoProps {
  collapsed: boolean;
  colorMode: string;
}

export const Logo = ({ collapsed, colorMode }: LogoProps) => {
  const darkMode = colorMode === 'dark';

  return (
    <Link
      href="/"
      className={cn(
        'logo my-[10px] flex h-[44px] w-auto [&:focus_img]:shadow-[inset_0_0_0_2px_var(--color-tertiary)] [&:focus_img]:rounded',
        // Centre the narrow mark on a collapsed rail; right-justify the wide wordmark when expanded.
        collapsed ? 'mx-auto justify-center' : 'justify-end',
      )}
    >
      {collapsed ? (
        <IconPrimaryLogoMark
          className={cn(
            'm-auto',
            darkMode ? 'text-white' : 'text-brand-primary',
          )}
          width={30}
          height={21}
        />
      ) : (
        // Colour SVG wordmark (light = navy #000647, dark = white #FFFFFF): render
        // as-is via <img>, not tinted through the currentColor icon components.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={
            darkMode ? '/brand/dfe-logo-dark.svg' : '/brand/dfe-logo-light.svg'
          }
          alt="DFE"
          className="ml-auto h-[44px] w-auto"
        />
      )}
    </Link>
  );
};
