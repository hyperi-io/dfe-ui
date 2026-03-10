'use client';

import {
  RuleFromSearchDb,
  type RuleFromSearchType,
} from '@/core/config/indexedDB';
import { notification } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export const useFetchSavedSearchFromParams = ({
  search,
}: {
  search: RuleFromSearchType | null;
}) => {
  const [api, contextHolder] = notification.useNotification();
  const searchParams = useSearchParams();
  const searchIdParam = searchParams.get('searchId');
  const [fetchedSearch, setFetchedSearch] = useState<RuleFromSearchType | null>(
    null,
  );
  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (searchIdParam && !search && fetchedIdRef.current !== searchIdParam) {
      fetchedIdRef.current = searchIdParam;
      RuleFromSearchDb.get(searchIdParam)
        .then((result) => setFetchedSearch(result ?? null))
        .catch(() => {
          api.error({
            title: 'Search not found',
            description: 'The search you are trying to access does not exist.',
            placement: 'bottomLeft',
          });
        });
    }
  }, [searchIdParam, search, api]);

  return {
    storedSearch: search ?? fetchedSearch,
    searchId: searchIdParam,
    notificationContextHolder: contextHolder,
  };
};
