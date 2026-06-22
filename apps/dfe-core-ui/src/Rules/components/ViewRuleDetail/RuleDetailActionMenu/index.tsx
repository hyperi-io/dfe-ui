import { ActionsMenu } from '@/core/components/ActionsMenu';
import { CloneRuleModal } from '@/Rules/components/CloneRuleModal';
import { DeleteRuleModal } from '@/Rules/components/DeleteRuleModal';
import { UpdateRuleDrawer } from '@/Rules/components/UpdateRuleDrawer';
import { useListRulesContext } from '@/Rules/contexts/ListRulesContext';
import { RuleCreateResponse } from '@/Rules/hooks/useCreateRule/types';
import { RuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { RuleUpdateResponse } from '@/Rules/hooks/useUpdateRule/types';
import { IconCopy, IconEdit, IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';

interface RuleDetailActionMenuProps {
  onEditSuccess?: (rule: RuleUpdateResponse) => void;
  rule: RuleDetail;
}

export const RuleDetailActionMenu = ({
  rule,
  onEditSuccess,
}: RuleDetailActionMenuProps) => {
  const { refetch: refetchRules, setSelectedRuleId } = useListRulesContext();

  const onCloneSuccess = (rule: RuleCreateResponse) => {
    setSelectedRuleId(rule.rule.rule_id);
    refetchRules();
  };

  const onDeleteSuccess = () => {
    setSelectedRuleId(null);
    refetchRules();
  };

  return (
    <ActionsMenu
      placement="left"
      classNames={{
        menu: 'w-48 p-0',
      }}
    >
      <UpdateRuleDrawer
        key="update-rule"
        rule={rule}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconEdit />}
            aria-label="Edit Rule"
          >
            Edit Rule
          </Button>
        }
        onSuccess={onEditSuccess}
      />
      <CloneRuleModal
        key="clone-rule"
        rule={rule}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconCopy />}
            aria-label="Clone Rule"
          >
            Clone Rule
          </Button>
        }
        onSuccess={onCloneSuccess}
      />

      <DeleteRuleModal
        key="delete-rule"
        rule={rule}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconTrash />}
            aria-label="Delete Rule"
          >
            Delete Rule
          </Button>
        }
        onSuccess={onDeleteSuccess}
      />
    </ActionsMenu>
  );
};
