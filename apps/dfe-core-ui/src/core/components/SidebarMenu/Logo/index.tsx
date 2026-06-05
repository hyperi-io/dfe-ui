import { cn } from '@/core/utils/style';
import { IconPrimaryLogoFull, IconPrimaryLogoMark } from '@repo/dfe-icons';

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
      className="logo my-[10px] flex justify-center h-[44px] w-auto mx-auto [&:focus_img]:shadow-[inset_0_0_0_2px_var(--color-tertiary)] [&:focus_img]:rounded"
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
        <IconPrimaryLogoFull
          className={cn(
            'm-auto',
            darkMode ? 'text-white' : 'text-brand-primary',
          )}
          width={86}
          height={44}
        />
      )}
    </Link>
  );
};
