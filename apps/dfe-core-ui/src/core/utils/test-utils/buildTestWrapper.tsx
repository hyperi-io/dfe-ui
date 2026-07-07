import React from 'react';

import { ThemeProvider } from '@/core/contexts/ClientContext/ThemeContext';
import { HyperdxPortProvider } from '@/core/contexts/HyperdxContext';
import { UseFetchInfiniteFilteredSourcesProps } from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { ListSourcesProvider } from '@/Sources/contexts/ListSourcesContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type WrapperComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => React.ReactElement;

type TestWrapperBuilderWithReactQuery = TestWrapperBuilder & {
  queryClient: QueryClient;
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

class ReactQueryTestProvider extends React.Component<{
  children: React.ReactNode;
  queryClientHolder: { current: QueryClient | null };
}> {
  readonly #queryClient = createTestQueryClient();

  componentDidMount() {
    this.props.queryClientHolder.current = this.#queryClient;
  }

  componentWillUnmount() {
    if (this.props.queryClientHolder.current === this.#queryClient) {
      this.props.queryClientHolder.current = null;
    }
  }

  render() {
    return (
      <QueryClientProvider client={this.#queryClient}>
        {this.props.children}
      </QueryClientProvider>
    );
  }
}

class TestWrapperBuilder {
  get wrapper(): WrapperComponent {
    return this.#build();
  }

  get queryClient(): QueryClient | null {
    return this.#queryClientRef.current;
  }

  #wrapperList: WrapperComponent[] = [];
  #queryClientRef: { current: QueryClient | null } = { current: null };

  constructor() {
    this.#wrapperList = [];
  }

  /**
   * Adds MockReactQueryProvider to the test wrapper
   *
   * @example
   *  const testWrapper = buildTestWrapper().withReactQuery()
   *  renderHook(() => useMyHook(), { wrapper: testWrapper.wrapper })
   *  // queryClient is set after the wrapper mounts
   *  testWrapper.queryClient?.getQueryCache()
   */
  withReactQuery(): TestWrapperBuilderWithReactQuery {
    const queryClientRef = this.#queryClientRef;

    this.#wrapperList.push(({ children }: { children: React.ReactNode }) => (
      <ReactQueryTestProvider queryClientHolder={queryClientRef}>
        {children}
      </ReactQueryTestProvider>
    ));

    return this as TestWrapperBuilderWithReactQuery;
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
   * Adds HyperdxPortProvider to the test wrapper
   * @example
   *  const { wrapper } = buildTestWrapper().withHyperdxPort('8090')
   */
  withHyperdxPort(port?: string) {
    this.#wrapperList.push(({ children }: { children: React.ReactNode }) => {
      return <HyperdxPortProvider port={port}>{children}</HyperdxPortProvider>;
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
