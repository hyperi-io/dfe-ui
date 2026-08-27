import { ActionsMenu } from '@/core/components/ActionsMenu';
import { CloneSourceDrawer } from '@/Sources/components/CloneSourceDrawer';
import { DeleteSourceModal } from '@/Sources/components/DeleteSourceModal';
import { EditSourceDrawer } from '@/Sources/components/EditSourceDrawer';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { TSourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { IconCopy, IconEdit, IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';

interface SourceDetailActionMenuProps {
  source: TSourceVersionDetail;
  onEditSuccess?: (source: TSourceUpdateResponse) => void;
}

export const SourceDetailActionMenu = ({
  source,
  onEditSuccess,
}: SourceDetailActionMenuProps) => {
  const { refetch: refetchSources, setSelectedSource } =
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
      <CloneSourceDrawer
        key="clone-source"
        sourceName={source.source}
        sourceVersion={source.current}
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
          setSelectedSource({
            source_name: null,
            source_version: null,
          });
          refetchSources();
        }}
      />
    </ActionsMenu>
  );
};
