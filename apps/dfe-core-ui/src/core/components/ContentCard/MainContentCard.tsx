import { cn } from '@/core/utils/style';
import { Layout } from 'antd';

const { Content } = Layout;

interface MainContentCardProps {
  className?: string;
  children: React.ReactNode;
}

export const MainContentCard = ({
  className,
  children,
}: MainContentCardProps) => {
  return (
    <Content
      className={cn(
        'px-6 py-4 bg-background dark:bg-dark-background',
        className,
      )}
    >
      {children}
    </Content>
  );
};
