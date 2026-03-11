import { ErrorHoundSvg } from '@/core/components/ErrorHoundSvg';
import { IconWrapper } from '@/core/components/IconWrapper';
import { cn } from '@/core/utils/style';
import { IconExclamationCircle as ExclamationCircleOutlined } from '@dfe/icons';
interface GenericErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const GenericErrorPage = ({
  children,
  className,
  title = 'An unexpected error occurred',
  description = 'Please try again later or contact support if the problem persists.',
}: GenericErrorProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center w-full h-full text-center',
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <ErrorHoundSvg className="w-4/12 h-auto m-auto dark:fill-white fill-primary" />
        {title && (
          <h1 className="mt-8 text-2xl font-light">
            <IconWrapper
              icon={<ExclamationCircleOutlined />}
              className="w-6 h-6 text-red-500 mr-2"
            />
            {title}
          </h1>
        )}
        {description && <p className="text-sm text-gray-500">{description}</p>}

        {children}
      </div>
    </div>
  );
};
