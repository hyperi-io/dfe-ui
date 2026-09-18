import { ActionsMenu } from '@/core/components/ActionsMenu';
import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
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

const ACTIONS_LIST = ({
  source,
  onEditSuccess,
  onDeleteSuccess,
  coreResource,
  mainSource,
}: SourceDetailActionMenuProps & {
  onDeleteSuccess: () => void;
  coreResource: boolean;
  mainSource: boolean;
}) => {
  const actions = [
    ...(coreResource || mainSource
      ? []
      : [
          {
            key: 'edit-source',
            component: (
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
            ),
          },
        ]),
    ...(mainSource
      ? []
      : [
          {
            key: 'clone-source',
            component: (
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
            ),
          },
        ]),
    ...(coreResource || mainSource
      ? []
      : [
          {
            key: 'delete-source',
            component: (
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
                onSuccess={onDeleteSuccess}
              />
            ),
          },
        ]),
  ];

  return actions;
};

export const SourceDetailActionMenu = ({
  source,
  onEditSuccess,
}: SourceDetailActionMenuProps) => {
  const { refetch: refetchSources, setSelectedSource } =
    useListSourcesContext();
  // The engine owns a core source and reconciles it, so it refuses every write to one.
  const coreResource = source.resource_type === RESOURCE_TYPES.CORE;
  const mainSource = source.source === 'main';

  const actions = ACTIONS_LIST({
    source,
    onEditSuccess,
    onDeleteSuccess: () => {
      setSelectedSource({
        source_name: null,
        source_version: null,
      });
      refetchSources();
    },
    coreResource,
    mainSource,
  });

  return (
    actions?.length > 0 && (
      <ActionsMenu
        placement="left"
        classNames={{
          menu: 'w-48 p-0',
        }}
      >
        {actions?.map((action) => action.component)}
      </ActionsMenu>
    )
  );
};
