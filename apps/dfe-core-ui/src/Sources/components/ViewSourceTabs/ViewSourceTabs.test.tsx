import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ViewSourceDetailTabs } from '.';

const { replace, searchParamsRef, detailsRef } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParamsRef: {
    current: new URLSearchParams(
      'source_name=main&source_version=1.0.0&tab=processing',
    ),
  },
  detailsRef: {
    current: { isMetaSchemaDefined: false, isDeployed: true },
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParamsRef.current,
  usePathname: () => '/sources',
}));

vi.mock('@/Sources/contexts/SourceDetailsContext', () => ({
  useSourceDetailsContext: () => detailsRef.current,
}));

vi.mock('@/Sources/contexts/ListSourcesContext', () => ({
  useListSourcesContext: () => ({ setSelectedSource: vi.fn() }),
}));

vi.mock('@/Sources/components/SourceTransformSelector', () => ({
  SourceTransformSelector: () => null,
}));
vi.mock('@/Sources/components/ViewSourceTabs/SourceFlowTabContent', () => ({
  SourceFlowTabContent: () => null,
}));
vi.mock(
  '@/Sources/components/ViewSourceTabs/SourceProcessingTabContent',
  () => ({
    SourceProcessingTabContent: () => null,
  }),
);
vi.mock('./ConfigurationDetailsTabContent', () => ({
  ConfigurationDetailsTabContent: () => null,
}));
vi.mock('./SampleEventsTabContent', () => ({
  SampleEventsTabContent: () => null,
}));
vi.mock('./SourceBuildDeployTabContent', () => ({
  SourceBuildDeployTabContent: () => null,
}));
vi.mock('./SourceColumnsTabContent', () => ({
  SourceColumnsTabContent: () => null,
}));
vi.mock('./contexts/PromoteRows.context', () => ({
  PromoteRowsProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

const { wrapper } = buildTestWrapper().withTheme();

const renderTabs = (sourceName: string) =>
  render(
    <ViewSourceDetailTabs
      {...({
        selectedSourceName: sourceName,
        selectedSourceVersion: '1.0.0',
        version: {},
      } as React.ComponentProps<typeof ViewSourceDetailTabs>)}
    />,
    { wrapper },
  );

describe('ViewSourceDetailTabs tab persistence', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it('opens Flow when the named tab is not on this source', () => {
    searchParamsRef.current = new URLSearchParams(
      'source_name=main&source_version=1.0.0&tab=processing',
    );
    detailsRef.current = { isMetaSchemaDefined: false, isDeployed: true };

    renderTabs('main');

    expect(replace).toHaveBeenCalledWith(
      '/sources?source_name=main&source_version=1.0.0',
    );
  });

  it('keeps a tab this source shows', () => {
    searchParamsRef.current = new URLSearchParams(
      'source_name=syslog&source_version=1.0.0&tab=processing',
    );
    detailsRef.current = { isMetaSchemaDefined: true, isDeployed: true };

    renderTabs('syslog');

    expect(replace).not.toHaveBeenCalled();
  });
});
