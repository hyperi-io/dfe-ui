'use client';

import {
  RuleFromSearchDb,
  type RuleFromSearchType,
} from '@/core/config/indexedDB';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type RuleMessage = Omit<RuleFromSearchType, 'id' | 'createdAt'>;

export const useHandleIncomingSearchMessage = () => {
  const [search, setSearch] = useState<RuleFromSearchType | null>(null);
  const searchParams = useSearchParams();
  const searchId = searchParams.get('searchId');
  const { replace } = useRouter();

  useEffect(() => {
    const handleMessage = (
      event: MessageEvent<{ type: string; payload: RuleMessage }>,
    ) => {
      if (event.origin !== process.env.NEXT_PUBLIC_HYPERDX_URL) {
        return;
      }
      if (event.data?.type !== 'CREATE_RULE_FROM_SEARCH') {
        return;
      }
      // Acknowledge message first — stops HyperDX from retrying continuously
      (event.source as Window)?.postMessage(
        { type: 'CREATE_RULE_ACK' },
        { targetOrigin: event.origin },
      );

      const id = uuidv4();

      void RuleFromSearchDb.add({
        id,
        savedSearchId: event.data.payload.savedSearchId,
        savedSearchName: event.data.payload.savedSearchName,
        sql: event.data.payload.sql,
        rawSql: event.data.payload.rawSql,
        config: event.data.payload.config,
        source: event.data.payload.source,

        createdAt: new Date().toISOString(),
      });

      setSearch({
        ...event.data.payload,
        id,
        createdAt: new Date().toISOString(),
      });

      replace(`/rules/create?searchId=${id}`);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [searchId, replace]);

  return { search };
};
