import { ActionsMenu } from '@/core/components/ActionsMenu';
import { CloneSourceModal } from '@/Sources/components/CloneSourceModal';
import { DeleteSourceModal } from '@/Sources/components/DeleteSourceModal';
import { EditSourceDrawer } from '@/Sources/components/EditSourceDrawer';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { SourceCreateResponse } from '@/Sources/hooks/useCreateSource/types';
import { SourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { SourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { IconCopy, IconEdit, IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';

interface SourceDetailActionMenuProps {
  source: SourceVersionDetail;
  onEditSuccess?: (source: SourceUpdateResponse) => void;
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
      <CloneSourceModal
        key="clone-source"
        name={source.source}
        display_name={source.display_name}
        enabled={source.enabled}
        versions={source.versions ?? []}
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
        onSuccess={(newSource: SourceCreateResponse) => {
          setSelectedSource({
            source_name: newSource.source,
            source_version: newSource.current,
          });
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
