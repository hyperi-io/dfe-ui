'use client';

import { TAppFileSet } from '@/core/hooks/apps/instances/useFetchApps/types';
import { Tabs } from 'antd';
import { FileSetPanel } from './FileSetPanel';

/**
 * The editor surfaces for one instance, one tab per declared file set.
 *
 * The sets come from the app manifest, so an app that reads no authored files
 * renders nothing at all here rather than an empty editor. That is the whole
 * point of the manifest: the UI must never carry a list of which apps have
 * editors.
 */
export const AppFileSets = ({
  service,
  instance,
  fileSets,
}: {
  service: string;
  instance: string;
  fileSets: TAppFileSet[];
}) => {
  if (fileSets.length === 0) return null;

  if (fileSets.length === 1) {
    return (
      <FileSetPanel
        service={service}
        instance={instance}
        fileSet={fileSets[0]}
      />
    );
  }

  return (
    <Tabs
      items={fileSets.map((fileSet) => ({
        key: fileSet.name,
        label: fileSet.name,
        children: (
          <FileSetPanel
            service={service}
            instance={instance}
            fileSet={fileSet}
          />
        ),
      }))}
    />
  );
};
