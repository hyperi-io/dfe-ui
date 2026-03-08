import inverseLogoFull from '@/core/assets/images/logo/inverse-logo-full.svg';
import inverseLogoMark from '@/core/assets/images/logo/inverse-logo-mark.svg';
import primaryLogoFull from '@/core/assets/images/logo/primary-logo-full.svg';
import primaryLogoMark from '@/core/assets/images/logo/primary-logo-mark.svg';
import Image from 'next/image';

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
        <Image
          className="block w-[30px]"
          src={darkMode ? inverseLogoMark : primaryLogoMark}
          alt="logo"
          loading="eager"
        />
      ) : (
        <Image
          className="my-[2px] block h-[40px]"
          src={darkMode ? inverseLogoFull : primaryLogoFull}
          alt="logo"
          loading="eager"
        />
      )}
    </Link>
  );
};
