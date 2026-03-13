import React from 'react';

import { ThemeProvider } from '@/core/contexts/ClientContext/ThemeContext';
import { ListSourcesProvider } from '@/Sources/contexts/ListSourcesContext';
import { UseFetchInfiniteFilteredSourcesProps } from '@/Sources/hooks/useFetchInfiniteFilteredSources/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type WrapperComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => React.ReactElement;

class TestWrapperBuilder {
  get wrapper(): WrapperComponent {
    return this.#build();
  }

  #wrapperList: WrapperComponent[] = [];

  constructor() {
    this.#wrapperList = [];
  }

  /**
   * Adds MockReactQueryProvider to the test wrapper
   *
   * @example
   *  const { wrapper } = buildTestWrapper().withReactQuery()
   */
  withReactQuery() {
    this.#wrapperList.push(({ children }: { children: React.ReactNode }) => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
    });

    return this;
  }

  /**
   * Adds ThemeProvider to the test wrapper
   *
   * @example
   *  const { wrapper } = buildTestWrapper().withTheme()
   */

  withTheme() {
    this.#wrapperList.push(({ children }: { children: React.ReactNode }) => {
      return <ThemeProvider>{children}</ThemeProvider>;
    });
    return this;
  }

  /**
   * Adds ListSourcesProvider to the test wrapper
   * @example
   *  const { wrapper } = buildTestWrapper().withListSourcesProvider()
   */

  withListSourcesProvider({
    defaultFilters,
  }: {
    defaultFilters?: UseFetchInfiniteFilteredSourcesProps;
  }) {
    this.#wrapperList.push(({ children }: { children: React.ReactNode }) => {
      return (
        <ListSourcesProvider defaultFilters={defaultFilters}>
          {children}
        </ListSourcesProvider>
      );
    });
    return this;
  }

  #build(): WrapperComponent {
    return ({ children }: { children: React.ReactNode }) => {
      return this.#wrapperList.reduceRight(
        (acc, Wrapper) => <Wrapper>{acc}</Wrapper>,
        children,
      ) as React.ReactElement;
    };
  }
}

export const buildTestWrapper = () => {
  return new TestWrapperBuilder();
};
