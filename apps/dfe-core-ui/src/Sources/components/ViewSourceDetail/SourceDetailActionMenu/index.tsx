import { ActionsMenu } from '@/core/components/ActionsMenu';
import { CloneSourceModal } from '@/Sources/components/CloneSourceModal';
import { DeleteSourceModal } from '@/Sources/components/DeleteSourceModal';
import { EditSourceDrawer } from '@/Sources/components/EditSourceDrawer';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { SourceDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { SourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { IconCopy, IconEdit, IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';

interface SourceDetailActionMenuProps {
  source: SourceDetail;
  onEditSuccess?: (source: SourceUpdateResponse) => void;
}

export const SourceDetailActionMenu = ({
  source,
  onEditSuccess,
}: SourceDetailActionMenuProps) => {
  const { refetch: refetchSources, setSelectedSourceName } =
    useListSourcesContext();
  return (
    <ActionsMenu
      placement="left"
      classNames={{
        menu: 'w-48 p-0',
      }}
    >
      <EditSourceDrawer
        key="edit-source"
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconEdit />}
            aria-label="Edit Source"
          >
            Edit Source
          </Button>
        }
        onSuccess={onEditSuccess}
      />
      <CloneSourceModal
        key="clone-source"
        source={source}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconCopy />}
            aria-label="Clone Source"
          >
            Clone Source
          </Button>
        }
        onSuccess={({ source: newSource }) => {
          setSelectedSourceName(newSource);
          refetchSources();
        }}
      />
      <DeleteSourceModal
        key="delete-source"
        source={source.source}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconTrash />}
            aria-label="Delete Source"
          >
            Delete Source
          </Button>
        }
        onSuccess={() => {
          setSelectedSourceName(null);
          refetchSources();
        }}
      />
    </ActionsMenu>
  );
};
