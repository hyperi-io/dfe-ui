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
        'logo my-2.5 flex w-auto [&:focus_img]:shadow-[inset_0_0_0_2px_var(--color-tertiary)] [&:focus_img]:rounded',
        'h-11',
        collapsed && 'mx-auto justify-center',
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
        // The caption's box is the wordmark image's own rendered width (an
        // inline-block shrinks to its widest child, the img), so the text
        // below can never render wider than the wordmark above it.
        <div className="mx-7 flex-start">
          {/* Colour SVG wordmark (light = navy #000647, dark = white #FFFFFF): render
              as-is via <img>, not tinted through the currentColor icon components. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              darkMode
                ? '/brand/dfe-logo-dark.svg'
                : '/brand/dfe-logo-light.svg'
            }
            alt="DFE"
            className="h-7.5 w-auto"
          />
          {/* Brand caption in Martel Sans ExtraBold, sized to the wordmark's width so it never overflows. */}
          <span
            className={cn(
              'font-brand block w-full text-left text-[8px] font-extrabold uppercase tracking-tight',
              'text-foreground-muted dark:text-dark-foreground-muted',
              'mt-1',
            )}
          >
            Data Fusion Engine
          </span>
        </div>
      )}
    </Link>
  );
};
