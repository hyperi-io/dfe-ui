import React from 'react';

import { ThemeProvider } from '@/core/contexts/ClientContext/ThemeContext';
import { UseFetchInfiniteFilteredSourcesProps } from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { ListSourcesProvider } from '@/Sources/contexts/ListSourcesContext';
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

  /**
   * Adds a context provider to the test wrapper
   * @example
   *  const { wrapper } = buildTestWrapper().withContext({
   *    context: Context,
   *    value: value,
   *  })
   */
  withContext<T>({
    provider: Provider,
    value,
  }: {
    provider: React.ComponentType<{ children: React.ReactNode; testValue?: T }>;
    value?: T;
  }) {
    this.#wrapperList.push(({ children }: { children: React.ReactNode }) => {
      return <Provider testValue={value}>{children}</Provider>;
    });
    return this;
  }

  /**
   * Adds a wrapper to the test wrapper
   * @example
   *  const { wrapper } = buildTestWrapper().withWrapper(({ children }) => (
   *    <div data-testid="wrapper">{children}</div>
   *  ))
   */
  withWrapper(wrapper: WrapperComponent) {
    this.#wrapperList.push(wrapper);
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
