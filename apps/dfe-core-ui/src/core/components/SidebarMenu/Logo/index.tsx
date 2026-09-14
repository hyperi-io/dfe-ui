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
        'logo my-[10px] flex w-auto [&:focus_img]:shadow-[inset_0_0_0_2px_var(--color-tertiary)] [&:focus_img]:rounded',
        // Centre the narrow mark on a collapsed rail; when expanded, start the
        // wordmark at the same left gutter as the nav group headers (px-8).
        collapsed
          ? 'h-[44px] mx-auto justify-center'
          : 'flex-col items-start justify-start gap-1 pl-8',
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
        <div className="inline-block">
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
            className="h-8 w-auto"
          />
          {/* Brand caption in Martel Sans ExtraBold, sized to the wordmark's width so it never overflows. */}
          <span
            className={cn(
              'font-brand block w-full text-left text-[9px] font-extrabold uppercase tracking-tight',
              'text-foreground-muted dark:text-dark-foreground-muted',
            )}
          >
            Data Fusion Engine
          </span>
        </div>
      )}
    </Link>
  );
};
