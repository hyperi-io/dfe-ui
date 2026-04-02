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
    user: 'John Wick',
    action: 'Login',
  }),
  createAuditLog({
    user: 'Jane Doe',
    action: 'Logout',
  }),
  createAuditLog({
    user: 'John Wick',
    action: 'Create User: Amazon Lily',
  }),
  createAuditLog({
    user: 'John Wick',
    action: 'Assign Role: Admin to Amazon Lily',
  }),
  createAuditLog({
    user: 'John Wick',
    action: 'Create Organisation: One Piece',
  }),
  createAuditLog({
    user: 'Jim Beam',
    action: 'Login',
  }),
  createAuditLog({
    user: 'Jim Beam',
    action: 'Create Source: linux_audit',
  }),
  createAuditLog({
    user: 'Jim Beam',
    action: 'Update Source: linux_audit',
  }),
  createAuditLog({
    user: 'Jim Beam',
    action: 'Logout',
  }),
  createAuditLog({
    user: 'Jim Beam',
    action: 'Login',
  }),
  createAuditLog({
    user: 'Jim Beam',
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
    action: 'Create User: Grace Hopper',
  }),
  createAuditLog({
    user: 'Ava Lovelace',
    action: 'Login',
  }),
];
