import { v4 as uuidv4 } from 'uuid';
import { randomTimestampBetweenOneMonthAgoAndNow } from './helpers';

interface AuditLogRequest {
  user?: string;
  action?: string;
  timestamp?: string;
}

export type AuditLog = AuditLogRequest & {
  id: string;
};

const createAuditLog = (request: AuditLogRequest) => {
  const id = uuidv4();
  const timestamp = randomTimestampBetweenOneMonthAgoAndNow();

  return {
    id,
    timestamp,
    ...request,
  };
};

export const AUDIT_LOGS_DATA = [
  createAuditLog({
    user: 'Claire Bell',
    action: 'Login',
  }),
  createAuditLog({
    user: 'Jane Doe',
    action: 'Logout',
  }),
  createAuditLog({
    user: 'Claire Bell',
    action: 'Create Account: Amazon Lily',
  }),
  createAuditLog({
    user: 'Claire Bell',
    action: 'Assign Role: Admin to Amazon Lily',
  }),
  createAuditLog({
    user: 'Claire Bell',
    action: 'Create Organisation: One Piece',
  }),
  createAuditLog({
    user: 'Jeremy Light',
    action: 'Login',
  }),
  createAuditLog({
    user: 'Jeremy Light',
    action: 'Create Source: linux_audit',
  }),
  createAuditLog({
    user: 'Jeremy Light',
    action: 'Update Source: linux_audit',
  }),
  createAuditLog({
    user: 'Jeremy Light',
    action: 'Logout',
  }),
  createAuditLog({
    user: 'Jeremy Light',
    action: 'Login',
  }),
  createAuditLog({
    user: 'Jeremy Light',
    action: 'Logout',
  }),
  createAuditLog({
    user: 'John Doe',
    action: 'Login',
  }),
  createAuditLog({
    user: 'John Doe',
    action: 'Logout',
  }),
  createAuditLog({
    user: 'Ava Lovelace',
    action: 'Create Account: Grace Hopper',
  }),
  createAuditLog({
    user: 'Ava Lovelace',
    action: 'Login',
  }),
];
