import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchInfiniteFilteredHunts } from '@/core/hooks/useFetchInfiniteFilteredHunts';
import { IconExternalLink } from '@repo/dfe-icons';
import { Button, Spin } from 'antd';

export const HuntBanner = ({ ruleName }: { ruleName: string }) => {
  const {
    data: { items: hunts, total_size },
    isLoading: isLoadingHunts,
    error,
  } = useFetchInfiniteFilteredHunts({
    rule: ruleName,
    queryEnabled: !!ruleName,
  });

  if (isLoadingHunts) {
    return (
      <>
        <Spin /> <span className="sr-only">Loading hunts</span>
      </>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title="Error fetching associated hunts"
        description={error.message}
      />
    );
  }

  return (
    <NotificationCard
      title={`${total_size} hunt ${total_size === 1 ? ' is ' : 's are '} associated with this rule:`}
      description={
        hunts
          ?.slice(0, 10)
          .map((hunt) => hunt.name)
          .join(', ') +
        (total_size && total_size > 10 ? ` and ${total_size - 10} more` : '')
      }

      type="info"
      variant="subtle"
      action={
        <>
          <Button
            icon={<IconExternalLink />}
            type="default"
            target="_blank"
            rel="noopener noreferrer"
            href={`/hunts?rule=${ruleName}`}
          >
            View associated hunts
          </Button>
        </>
      }
    />
  );
};
