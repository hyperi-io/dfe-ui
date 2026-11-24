import { IconPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

export const ButtonLinkSavedSearch = ({
  target = '_self',
}: {
  target?: '_blank' | '_self';
}) => {
  const router = useRouter();
  return (
    <Button
      type="primary"
      icon={<IconPlus />}
      onClick={() => {
        if (target === '_blank') {
          window.open('/observe/search/list', '_blank', 'noopener,noreferrer');
          return;
        }
        router.push('/observe/search/list');
      }}
    >
      Add Rule from Search
    </Button>
  );
};
