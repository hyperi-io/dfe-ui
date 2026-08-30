'use client';

import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { useFetchAppRouting } from '@/core/hooks/apps/routing/useFetchAppRouting';
import { useSyncAppRouting } from '@/core/hooks/apps/routing/useSyncAppRouting';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { ApiError } from '@/core/config/api/client';
import { IconAlertTriangle, IconRefresh } from '@repo/dfe-icons';
import { Button, Spin, Tag } from 'antd';
import {
  hasSourceRules,
  sourceRoutingRule,
  TSourceRule,
} from './sourceRoutingRule';

const RuleSummary = ({ rule }: { rule: TSourceRule | null }) => {
  if (!rule) return <span className="text-sm">no rule</span>;
  return (
    <span className="flex flex-wrap items-center gap-1">
      <Tag className="font-mono">{rule.field}</Tag>
      <Tag>{rule.mode}</Tag>
      {rule.match_value && <Tag className="font-mono">{rule.match_value}</Tag>}
    </span>
  );
};

/**
 * The receiver's routing rule for this source, and whether it is deployed.
 *
 * Read-only on purpose: the rule is compiled from the source definition, so
 * an edit here would be an edit to derived state. A difference between what
 * the sources say and what the receiver carries is drift to re-sync.
 */
export const SourceRoutingCard = ({
  service,
  instance,
  source,
}: {
  service: string;
  instance: string;
  source: string;
}) => {
  const {
    data: routing,
    isLoading,
    error,
  } = useFetchAppRouting({
    service,
    instance,
  });
  const {
    data: syncResult,
    mutate: syncRouting,
    isPending,
  } = useSyncAppRouting({ service, instance });

  if (isLoading) {
    return (
      <SectionCard title="Receiver routing">
        <Spin size="small" />
      </SectionCard>
    );
  }

  // A 400 means this app's routing is not derived from the source definitions,
  // so the card does not apply.
  if (error instanceof ApiError && error.status === 400) return null;

  if (error || !routing) {
    return (
      <SectionCard title="Receiver routing">
        <NotificationCard
          type="info"
          variant="subtle"
          title="Routing is not readable"
          description={error?.message}
        />
      </SectionCard>
    );
  }

  // Some compilers emit a whole-app map rather than per-source rules, and only
  // the latter has anything to say on a source page.
  if (!hasSourceRules(routing.compiled)) return null;

  const state = sourceRoutingRule(routing.compiled, routing.deployed, source);

  return (
    <SectionCard
      title="Receiver routing"
      rightTitleSlot={
        state.drift ? (
          <RbacProtected action={RbacProtected.rbacActions.helmvars_write}>
            <RbacProtected.Unrestricted>
              <Button
                size="small"
                icon={<IconRefresh />}
                loading={isPending}
                onClick={() => syncRouting()}
              >
                Sync routing
              </Button>
            </RbacProtected.Unrestricted>
          </RbacProtected>
        ) : undefined
      }
    >
      <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
        {`Compiled by the ${routing.compiler} compiler into ${routing.values_path}`}
      </p>

      {routing.absent && (
        <NotificationCard
          type="warning"
          icon={<IconAlertTriangle />}
          title="The receiver carries no routing at all"
          description="It is running on its built-in defaults, so every source rule ever defined is being ignored."
        />
      )}

      <dl className="grid grid-cols-[9rem_1fr] items-center gap-2 text-sm">
        <dt className="font-semibold">From the sources</dt>
        <dd>
          <RuleSummary rule={state.compiled} />
        </dd>
        <dt className="font-semibold">On the receiver</dt>
        <dd>
          <RuleSummary rule={state.deployed} />
        </dd>
        <dt className="font-semibold">State</dt>
        <dd>
          {state.drift ? (
            <Tag color="orange">drift</Tag>
          ) : (
            <Tag color="green">synced</Tag>
          )}
        </dd>
      </dl>

      {syncResult && <WriteResultFeedback result={syncResult} />}
    </SectionCard>
  );
};
