'use client';

import { uiBuildVersion } from '@/core/appVersion/buildVersion';
import { Tooltip } from '@/core/components/Tooltip';
import { useFetchSystemVersion } from '@/core/hooks/useFetchSystemVersion';
import { cn } from '@/core/utils/style';

interface SuiteVersionProps {
  className?: string;
}

// A component pin is a container ref (`v1.20.0@sha256:...`), the engine and
// app versions are bare numbers, so trim to the tag and let one `v` do the
// work for all of them.
const componentLabel = (name: string, version: string) =>
  `${name} v${version.split('@')[0].replace(/^v/, '')}`;

// The suite version is what an operator quotes in a support conversation, so
// it is the one line in the sidebar; everything it resolves to -- engine, the
// API's own ui pin, the console build actually running, and every pinned app
// -- is on hover.
export const SuiteVersion = ({ className }: SuiteVersionProps) => {
  const { data } = useFetchSystemVersion();
  const consoleVersion = uiBuildVersion();

  if (!data) {
    return null;
  }

  const appEntries = Object.entries(data.apps ?? {}).map(([name, version]) =>
    componentLabel(name, version),
  );

  const tooltipLines = [
    componentLabel('engine', data.engine),
    data.ui ? componentLabel('ui', data.ui) : null,
    consoleVersion ? componentLabel('console', consoleVersion) : null,
    ...appEntries,
  ].filter((line): line is string => Boolean(line));

  return (
    <Tooltip
      title={
        <div className="flex flex-col">
          {tooltipLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      }
      placement="top"
    >
      <p
        className={cn(
          'text-sm text-gray-400 dark:text-gray-500 cursor-default',
          className,
        )}
      >
        {data.stack ?? data.engine}
      </p>
    </Tooltip>
  );
};
