import { ActionsMenu } from '@/core/components/ActionsMenu';
import { UpdateRuleDrawer } from '@/Rules/components/UpdateRuleDrawer';
import { RuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { RuleUpdateResponse } from '@/Rules/hooks/useUpdateRule/types';
import { IconEdit } from '@repo/dfe-icons';
import { Button } from 'antd';

interface RuleDetailActionMenuProps {
  onEditSuccess?: (rule: RuleUpdateResponse) => void;
  rule: RuleDetail;
}

export const RuleDetailActionMenu = ({
  rule,
  onEditSuccess,
}: RuleDetailActionMenuProps) => {
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
    </ActionsMenu>
  );
};
