import React from 'react';

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
