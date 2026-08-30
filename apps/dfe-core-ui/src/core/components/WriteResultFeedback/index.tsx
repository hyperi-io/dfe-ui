import { NotificationCard } from '@/core/components/NotificationCard';
import {
  IconAlertTriangle,
  IconCheck,
  IconGitCommit,
  IconGitPullRequest,
} from '@repo/dfe-icons';
import { Tag } from 'antd';

/**
 * How a change reaches the running process. The engine sends this on every
 * write because a saved file is not the same as a live one - vector polls and
 * reloads, vrl compiles at startup and needs the pod to roll.
 *
 * The app surface and the backing-service surface use different words for
 * different costs, so both sets live here rather than being flattened into one
 * vocabulary that would blur a pod roll into a StatefulSet recreation.
 */
export const RELOAD_LABEL: Record<string, string> = {
  // App file and dial writes.
  hot: 'Applied without a restart',
  roll: 'Takes effect when the pod rolls',
  restart: 'Needs a manual restart',
  // Backing-service writes.
  apply: 'Reconciles in place, with no restart',
  recreate: 'The StatefulSet has to be recreated by hand before this applies',
  redeploy: 'Changes which objects exist, so the store is redeployed',
};

/**
 * Reload outcomes that are not routine. `recreate` needs hands on the cluster
 * and `redeploy` adds or removes the store's objects, so neither may read as an
 * ordinary success.
 */
const DISRUPTIVE_RELOAD = new Set(['recreate', 'redeploy']);

export type TWriteResult = {
  changed: boolean;
  commit_sha?: string | null;
  auto_merged?: boolean;
  review_required?: boolean;
  pr_url?: string | null;
  reload?: string | null;
  version?: number | null;
};

/**
 * The gitops trust signals for one mutation.
 *
 * Every write here is a git commit rather than a live cluster change, so
 * "saved" on its own is a lie: what the operator needs is whether anything
 * changed, which commit carries it, whether it is waiting on review, and when
 * the running process will actually see it.
 */
export const WriteResultFeedback = ({
  result,
  className,
}: {
  result: TWriteResult;
  className?: string;
}) => {
  if (result.review_required) {
    return (
      <NotificationCard
        className={className}
        type="warning"
        icon={<IconGitPullRequest />}
        title="Opened for review"
        description={
          result.pr_url
            ? `This deployment commits through a pull request. Review it at ${result.pr_url}`
            : 'This deployment commits through a pull request, so the change is not applied yet.'
        }
      />
    );
  }

  if (!result.changed) {
    return (
      <NotificationCard
        className={className}
        type="info"
        variant="subtle"
        title="No change"
        description="What you submitted already matches what is committed, so nothing was written."
      />
    );
  }

  const disruptive = !!result.reload && DISRUPTIVE_RELOAD.has(result.reload);

  return (
    <NotificationCard
      className={className}
      type={disruptive ? 'warning' : 'success'}
      icon={disruptive ? <IconAlertTriangle /> : <IconCheck />}
      title={disruptive ? 'Committed, but not applied on sync' : 'Committed'}
      description={
        <div className="flex flex-wrap items-center gap-2">
          {result.commit_sha && (
            <Tag icon={<IconGitCommit className="inline size-3" />}>
              {result.commit_sha.slice(0, 7)}
            </Tag>
          )}
          {result.version != null && <Tag>version {result.version}</Tag>}
          {result.auto_merged && <Tag color="green">auto-merged</Tag>}
          {result.reload && (
            <span className="text-sm">
              {RELOAD_LABEL[result.reload] ?? result.reload}
            </span>
          )}
        </div>
      }
    />
  );
};

/**
 * The syntax-validation verdict that rides along with a file write.
 *
 * 'unavailable' is not a pass: it means no backend could check the content, so
 * it is reported as its own state rather than folded into success.
 */
export const ValidationFeedback = ({
  validation,
  className,
}: {
  validation?: {
    status: string;
    backend?: string;
    message?: string;
    errors?: string[];
  } | null;
  className?: string;
}) => {
  if (!validation || validation.status === 'disabled') return null;

  if (validation.status === 'valid') {
    return (
      <NotificationCard
        className={className}
        type="success"
        variant="ghost"
        icon={<IconCheck />}
        title={`Checked by ${validation.backend || 'the syntax validator'}`}
      />
    );
  }

  if (validation.status === 'unavailable') {
    return (
      <NotificationCard
        className={className}
        type="info"
        variant="subtle"
        icon={<IconAlertTriangle />}
        title="Not syntax checked"
        description={
          validation.message ||
          'No validation backend was available, so the content was saved unchecked.'
        }
      />
    );
  }

  return (
    <NotificationCard
      className={className}
      type="error"
      icon={<IconAlertTriangle />}
      title={validation.message || 'Syntax check failed'}
      description={
        validation.errors?.length ? (
          <ul className="list-disc pl-4">
            {validation.errors.map((line) => (
              <li key={line} className="font-mono text-xs">
                {line}
              </li>
            ))}
          </ul>
        ) : undefined
      }
    />
  );
};
