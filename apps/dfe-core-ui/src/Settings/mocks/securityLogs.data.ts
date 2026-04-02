import { v4 as uuidv4 } from 'uuid';
import { randomTimestampBetweenOneMonthAgoAndNow } from './helpers';
interface SecurityLogRequest {
  user?: string;
  detail?: string;
  severity?: 'info' | 'warning' | 'error';
}

export type SecurityLog = SecurityLogRequest & {
  id: string;
  timestamp: string;
};

const createSecurityLog = (request: SecurityLogRequest) => {
  const id = uuidv4();
  const timestamp = randomTimestampBetweenOneMonthAgoAndNow();
  return {
    id,
    timestamp,
    ...request,
  };
};
export const SECURITY_LOGS_DATA: SecurityLog[] = [
  createSecurityLog({
    user: 'system',
    detail: 'System upgrade complete: v1.0.1',
    severity: 'info',
  }),
  createSecurityLog({
    user: 'system',
    detail: 'System restarted',
    severity: 'warning',
  }),
  createSecurityLog({
    user: 'system',
    detail: 'User login failed',
    severity: 'error',
  }),
  createSecurityLog({
    user: 'system',
    detail: 'User login failed',
    severity: 'error',
  }),
  createSecurityLog({
    user: 'system',
    detail: 'System upgrade complete: v1.2.0',
    severity: 'info',
  }),
  createSecurityLog({
    user: 'system',
    detail: 'System restarted',
    severity: 'warning',
  }),
  createSecurityLog({
    user: 'system',
    detail: 'User login failed',
    severity: 'error',
  }),
  createSecurityLog({
    user: 'system',
    detail: 'User login failed',
    severity: 'error',
  }),
  createSecurityLog({
    user: 'system',
    detail: 'New artifacts available: v1.2.3',
    severity: 'info',
  }),
];
