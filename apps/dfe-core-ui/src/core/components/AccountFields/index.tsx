import { AccountGroupSelect } from '@/core/components/AccountGroupSelect';
import { Form } from '@/core/components/Form';
import {
  OrgChoiceFormItem,
  type TOrgChoice,
} from '@/core/components/OrgChoiceFormItem';
import { OrgRoleFormItem } from '@/core/components/OrgRoleFormItem';
import { Tooltip } from '@/core/components/Tooltip';
import { Input, type FormRule } from 'antd';
import {
  emailAvailableRule,
  usernameAvailableRule,
} from './accountAvailability';

// Long enough that a check goes out once typing pauses, not on every key.
const AVAILABILITY_DEBOUNCE_MS = 400;

const ACCOUNT_ORG_CHOICES: readonly TOrgChoice[] = ['own', 'customer'];

/**
 * An account's details, laid out once for create and edit alike.
 * A new account picks its username, checked for availability as it is typed, and its password. An existing one shows its username locked.
 */
export const AccountDetailFields = ({
  isNew,
  rule,
}: {
  isNew: boolean;
  rule: FormRule;
}) => (
  <>
    <Form.Item label="Username" required={isNew}>
      <Tooltip
        title={
          isNew
            ? "A username identifies the account and can't be changed later"
            : "Usernames can't be changed"
        }
        placement="topLeft"
      >
        {/* A disabled input fires no hover, so the wrapper carries the tooltip. */}
        <span className="block">
          <Form.Item
            name="username"
            noStyle
            rules={isNew ? [rule, usernameAvailableRule] : undefined}
            validateDebounce={isNew ? AVAILABILITY_DEBOUNCE_MS : undefined}
            validateFirst
          >
            <Input
              aria-label="Username"
              disabled={!isNew}
              placeholder={isNew ? 'Enter username' : undefined}
            />
          </Form.Item>
        </span>
      </Tooltip>
    </Form.Item>

    <Form.Item
      name="email"
      label="Email"
      rules={isNew ? [rule, emailAvailableRule] : [rule]}
      validateDebounce={isNew ? AVAILABILITY_DEBOUNCE_MS : undefined}
      validateFirst
    >
      <Input type="email" placeholder="Enter email" />
    </Form.Item>

    <Form.Item name="name" label="Name" rules={[rule]}>
      <Input placeholder="Enter name" />
    </Form.Item>

    <Form.Item name="phone" label="Phone" rules={[rule]}>
      <Input placeholder="Enter phone" />
    </Form.Item>

    {isNew && (
      <Form.Item name="password" label="Password" rules={[rule]}>
        <Input.Password
          autoComplete="new-password"
          placeholder="Enter password"
        />
      </Form.Item>
    )}
  </>
);

/**
 * Where an account belongs and what it holds there, laid out once for create and edit alike.
 * Choosing a customer organisation offers its one role at once, any other choice free groups, and no choice yet offers neither. Without *withOrg* only the groups show.
 */
export const AccountAccessFields = ({
  choice,
  groupsDisabled,
  rule,
  withOrg = true,
}: {
  choice?: TOrgChoice;
  groupsDisabled?: boolean;
  rule?: FormRule;
  withOrg?: boolean;
}) => {
  const groups = (
    <Form.Item name="groups" label="Groups" rules={rule ? [rule] : undefined}>
      <AccountGroupSelect disabled={groupsDisabled} />
    </Form.Item>
  );
  if (!withOrg) {
    return groups;
  }
  return (
    <>
      <OrgChoiceFormItem choices={ACCOUNT_ORG_CHOICES} />
      {choice === 'customer' && <OrgRoleFormItem />}
      {choice !== undefined && choice !== 'customer' && groups}
    </>
  );
};
