'use client';

import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { useFetchAppRouting } from '@/core/hooks/apps/routing/useFetchAppRouting';
import { useSyncAppRouting } from '@/core/hooks/apps/routing/useSyncAppRouting';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { IconAlertTriangle, IconRefresh } from '@repo/dfe-icons';
import { Button, Spin, Tag } from 'antd';
import {
  hasSourceRules,
  sourceRoutingRule,
  TSourceRule,
} from './sourceRoutingRule';

/**
 * Names the app whose routing this is.
 *
 * More than one app can compile per-source routing, so the heading says which
 * one rather than assuming the receiver.
 */
const RoutingHeading = ({ service }: { service: string }) => (
  <h2 className="text-foreground-muted dark:text-dark-foreground-muted text-base font-semibold">
    {`${service} routing`}
  </h2>
);

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
  hasCompiledRouting,
}: {
  service: string;
  instance: string;
  source: string;
  /** From the app manifest. False means the routing routes answer 400. */
  hasCompiledRouting: boolean;
}) => {
  const {
    data: routing,
    isLoading,
    error,
  } = useFetchAppRouting({
    service,
    instance,
    queryEnabled: hasCompiledRouting,
  });
  const {
    data: syncResult,
    mutate: syncRouting,
    isPending,
  } = useSyncAppRouting({ service, instance });

  // The manifest says whether this app has routing at all, so an app without it
  // is never asked.
  if (!hasCompiledRouting) return null;

  if (isLoading) {
    return (
      <SectionCard title={<RoutingHeading service={service} />}>
        <Spin size="small" />
      </SectionCard>
    );
  }

  if (error || !routing) {
    return (
      <SectionCard title={<RoutingHeading service={service} />}>
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
      title={<RoutingHeading service={service} />}
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
        {/* An app owns each derived block whole, so the compile writes more
            than one of them and all of them are named here. */}
        {`Compiled by the ${routing.compiler} compiler into ${Object.values(routing.values_paths ?? {}).join(', ')}`}
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
