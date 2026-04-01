/*
 * Supported Fetchers from hyperi-io/dfe-fetchers
 * AWS      cloudtrail, guardduty, securityhub, config, cloudwatch_logs, cloudwatch_metrics
 * Azure    activity_log, defender, sentinel, entra_id
 * M365     audit_log, message_trace, dlp, alerts
 * GCP      audit_logs, scc, cloud_logging
 */

export const FETCHERS = [
  {
    value: 'aws.cloudtrail',
    label: 'AWS: CloudTrail',
  },
  {
    value: 'aws.guardduty',
    label: 'AWS: GuardDuty',
  },
  {
    value: 'aws.securityhub',
    label: 'AWS: Security Hub',
  },
  {
    value: 'aws.config',
    label: 'AWS: Config',
  },
  {
    value: 'aws.cloudwatch_logs',
    label: 'AWS: CloudWatch Logs',
  },
  {
    value: 'aws.cloudwatch_metrics',
    label: 'AWS: CloudWatch Metrics',
  },
  {
    value: 'azure.activity_log',
    label: 'Azure: Activity Log',
  },
  {
    value: 'azure.defender',
    label: 'Azure: Defender',
  },
  {
    value: 'azure.sentinel',
    label: 'Azure: Sentinel',
  },
  {
    value: 'azure.entra_id',
    label: 'Azure: Entra ID',
  },
  {
    value: 'm365.audit_log',
    label: 'M365: Audit Log',
  },
  {
    value: 'm365.message_trace',
    label: 'M365: Message Trace',
  },
  {
    value: 'm365.dlp',
    label: 'M365: DLP',
  },
  {
    value: 'm365.alerts',
    label: 'M365: Alerts',
  },
  {
    value: 'gcp.audit_logs',
    label: 'GCP: Audit Logs',
  },
  {
    value: 'gcp.scc',
    label: 'GCP: SCC',
  },
  {
    value: 'gcp.cloud_logging',
    label: 'GCP: Cloud Logging',
  },
];

export const FETCHER_DEFAULTS = {
  aws: {
    base_url: 'https://{service}.{region}.amazonaws.com',
  },
  azure: {
    base_url: 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token',
    base_urls: [
      'https://management.azure.com',
      'https://graph.microsoft.com',
      'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token',
    ],
  },
  m365: {
    base_url: 'https://api.m365.com',
    base_urls: [
      'https://manage.office.com',
      'https://graph.microsoft.com',
      'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token',
    ],
  },
  gcp: {
    base_url: 'https://api.gcp.com',
    base_urls: [
      'https://logging.googleapis.com',
      'https://securitycenter.googleapis.com',
      'https://oauth2.googleapis.com/token',
    ],
  },
};

export const AUTH_TYPES = [
  {
    value: 'oauth2',
    label: 'OAuth2',
  },
  {
    value: 'api_key',
    label: 'API Key',
  },
  {
    value: 'none',
    label: 'No Auth',
  },
];
