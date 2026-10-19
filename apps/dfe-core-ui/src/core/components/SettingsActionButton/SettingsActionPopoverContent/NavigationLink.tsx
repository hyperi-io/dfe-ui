import Link from 'next/link';

export const NavigationLink = ({
  link,
  icon,
  label,
}: {
  link: string;
  icon: React.ReactNode;
  label: string;
}) => {
  return (
    <Link
      href={link}
      className="flex w-full items-center gap-2 text-foreground/80 dark:text-dark-foreground/80 hover:text-foreground dark:hover:text-dark-foreground hover:font-medium"
    >
      {icon}
      {label}
    </Link>
  );
};
