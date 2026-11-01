'use client';

import {
  RuleFromSearchDb,
  type RuleFromSearchType,
} from '@/Rules/config/indexedDB';
import { useHyperdxUrl } from '@/core/contexts/HyperdxContext';
import { notification } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';

/** How long after a search is stored that an identical message is a retry, not a new search. */
const RETRY_WINDOW_MS = 5_000;

const ruleMessageSchema = z.object({
  savedSearchId: z.string().optional(),
  savedSearchName: z.string().optional(),
  sql: z.string(),
  rawSql: z.string(),
  config: z.record(z.string(), z.unknown()),
  source: z.object({
    name: z.string(),
    kind: z.string(),
    from: z.object({ tableName: z.string(), databaseName: z.string() }),
    connection: z.string(),
  }),
});

type RuleMessage = z.infer<typeof ruleMessageSchema>;

export const useHandleIncomingSearchMessage = () => {
  const [search, setSearch] = useState<RuleFromSearchType | null>(null);
  const [api, notificationContextHolder] = notification.useNotification();
  const hyperdxUrl = useHyperdxUrl();
  const { replace } = useRouter();
  // HyperDX resends until it is acknowledged, so a retry can land while the
  // first copy is still being written or just after it has been stored.
  const writing = useRef(new Set<string>());
  const lastStored = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    const handleMessage = async (
      event: MessageEvent<{ type: string; payload: unknown }>,
    ) => {
      if (event.data?.type !== 'CREATE_RULE_FROM_SEARCH') {
        return;
      }
      const parsed = ruleMessageSchema.safeParse(event.data.payload);
      if (!parsed.success) {
        return;
      }

      const message: RuleMessage = parsed.data;
      const key = JSON.stringify(message);
      const sender = event.source as Window | null;
      const acknowledge = () =>
        sender?.postMessage(
          { type: 'CREATE_RULE_ACK' },
          { targetOrigin: event.origin },
        );

      const last = lastStored.current;
      if (last?.key === key && Date.now() - last.at < RETRY_WINDOW_MS) {
        acknowledge();
        return;
      }
      if (writing.current.has(key)) {
        return;
      }

      writing.current.add(key);
      const record: RuleFromSearchType = {
        ...message,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      try {
        await RuleFromSearchDb.add(record);
      } catch {
        api.error({
          title: 'The search could not be saved',
          description:
            'The browser refused to store it. HyperDX will send it again.',
          placement: 'bottomLeft',
        });
        return;
      } finally {
        writing.current.delete(key);
      }

      lastStored.current = { key, at: Date.now() };
      acknowledge();
      setSearch(record);
      replace(`/rules/create?searchId=${record.id}`);
    };

    const listener = (event: MessageEvent) => {
      if (!hyperdxUrl || event.origin !== hyperdxUrl) {
        return;
      }
      void handleMessage(event);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [replace, hyperdxUrl, api]);

  return { search, notificationContextHolder };
};
