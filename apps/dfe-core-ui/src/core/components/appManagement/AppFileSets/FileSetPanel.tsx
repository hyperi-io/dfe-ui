'use client';

import {
  ValidationFeedback,
  WriteResultFeedback,
} from '@/core/components/WriteResultFeedback';
import { useDeleteAppFile } from '@/core/hooks/apps/files/useDeleteAppFile';
import { useDryRunAppFile } from '@/core/hooks/apps/files/useDryRunAppFile';
import { useFetchAppFile } from '@/core/hooks/apps/files/useFetchAppFile';
import { useFetchAppFileLinks } from '@/core/hooks/apps/files/useFetchAppFileLinks';
import { useFetchAppFiles } from '@/core/hooks/apps/files/useFetchAppFiles';
import { useRelinkAppFiles } from '@/core/hooks/apps/files/useRelinkAppFiles';
import { useUpdateAppFile } from '@/core/hooks/apps/files/useUpdateAppFile';
import { TAppFileSet } from '@/core/hooks/apps/instances/useFetchApps/types';
import { AnnotatedAceEditor } from '@/core/components/AceEditor/AnnotatedAceEditor';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import {
  IconAlertTriangle,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconTrash,
} from '@repo/dfe-icons';
import { Button, Input, Spin, Tag } from 'antd';
import { useState } from 'react';
import { aceModeForFile } from './aceMode';
import { DryRunResult } from './DryRunResult';
import { LinkArtifactDrawer } from './LinkArtifactDrawer';

const NEW_FILE = Symbol('new-file');

/**
 * One declared file set: the files in it, an editor over them, and the
 * library links that produced them.
 *
 * Everything about the set - which extensions it takes, what language it is,
 * whether a write needs a pod roll - comes from the app manifest via
 * `GET /api/v1/apps`. Nothing here knows which app it is looking at.
 */
export const FileSetPanel = ({
  service,
  instance,
  fileSet,
}: {
  service: string;
  instance: string;
  fileSet: TAppFileSet;
}) => {
  const setName = fileSet.name;
  const [selected, setSelected] = useState<string | typeof NEW_FILE | null>(
    null,
  );
  const [draftName, setDraftName] = useState('');
  // null means nothing unsaved, so the committed content shows through.
  const [draft, setDraft] = useState<string | null>(null);

  const {
    data: files,
    isLoading,
    error,
  } = useFetchAppFiles({
    service,
    instance,
    setName,
  });
  const { data: links } = useFetchAppFileLinks({
    service,
    instance,
    setName,
  });

  const isNewFile = selected === NEW_FILE;
  const selectedName = isNewFile ? draftName : (selected ?? '');

  const { data: file } = useFetchAppFile({
    service,
    instance,
    setName,
    filename: isNewFile ? '' : (selected ?? ''),
  });

  const {
    data: writeResult,
    mutate: writeFile,
    isPending: isWriting,
    error: writeError,
    reset: resetWrite,
  } = useUpdateAppFile({
    service,
    instance,
    setName,
    filename: selectedName,
    onSuccess: () => {
      if (isNewFile) setSelected(draftName);
      setDraft(null);
    },
  });
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteAppFile({
    service,
    instance,
    setName,
    onSuccess: () => setSelected(null),
  });
  const {
    data: dryRunResult,
    mutate: dryRun,
    isPending: isDryRunning,
    error: dryRunError,
    reset: resetDryRun,
  } = useDryRunAppFile({ service, instance, setName });
  const { mutate: relink, isPending: isRelinking } = useRelinkAppFiles({
    service,
    instance,
    setName,
  });

  const content = draft ?? file?.content ?? '';

  const startNewFile = () => {
    resetWrite();
    resetDryRun();
    setSelected(NEW_FILE);
    setDraftName('');
    setDraft('');
  };

  const openFile = (name: string) => {
    resetWrite();
    resetDryRun();
    setSelected(name);
    setDraft(null);
  };

  const linkFor = (name: string) => links?.find((link) => link.name === name);
  const writeMessage =
    getApiErrorResponseBody(writeError)?.message ?? writeError?.message;
  const dryRunMessage =
    getApiErrorResponseBody(dryRunError)?.message ?? dryRunError?.message;

  if (isLoading) return <Spin size="small" />;

  if (error) {
    return (
      <NotificationCard
        type="error"
        title={`Could not read the ${setName} files`}
        description={error.message}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
          {`Read from ${fileSet.directory_setting || 'the app defaults'}. Accepts ${fileSet.suffixes.join(', ')}.`}
        </p>
        <div className="flex gap-2">
          <RbacProtected action={RbacProtected.rbacActions.helmvars_write}>
            <RbacProtected.Unrestricted>
              <Button size="small" icon={<IconPlus />} onClick={startNewFile}>
                New file
              </Button>
              <LinkArtifactDrawer
                service={service}
                instance={instance}
                setName={setName}
                suffixes={fileSet.suffixes}
              />
              <Button
                size="small"
                icon={<IconRefresh />}
                loading={isRelinking}
                onClick={() => relink()}
              >
                Relink all
              </Button>
            </RbacProtected.Unrestricted>
          </RbacProtected>
        </div>
      </div>

      <div className="flex gap-4">
        <ul className="flex w-56 shrink-0 flex-col gap-1">
          {(files ?? []).map((entry) => {
            const link = linkFor(entry.name);
            return (
              <li key={entry.name}>
                <button
                  type="button"
                  onClick={() => openFile(entry.name)}
                  aria-current={selected === entry.name}
                  className="bg-foreground/5 dark:bg-dark-foreground/5 flex w-full flex-col gap-1 rounded-md px-3 py-2 text-left"
                >
                  <span className="font-mono text-sm">{entry.name}</span>
                  <span className="flex flex-wrap gap-1">
                    <Tag>{`${entry.size_bytes} B`}</Tag>
                    {link && (
                      <Tag color="blue">
                        {link.tag
                          ? `${link.artifact}@${link.tag}`
                          : `${link.artifact}@${link.version}`}
                      </Tag>
                    )}
                    {link?.drift && <Tag color="orange">edited locally</Tag>}
                    {link?.outdated && <Tag color="gold">outdated</Tag>}
                    {link?.missing && <Tag color="red">artefact missing</Tag>}
                  </span>
                </button>
              </li>
            );
          })}
          {(files ?? []).length === 0 && (
            <li className="text-foreground/50 dark:text-dark-foreground/50 text-sm">
              No files yet.
            </li>
          )}
        </ul>

        <div className="min-w-0 flex-1">
          {selected === null ? (
            <NotificationCard
              type="info"
              variant="subtle"
              title="Select a file to edit it"
              description={`A change here is a git commit. ${
                fileSet.reload === 'hot'
                  ? 'This app reloads it without a restart.'
                  : 'This app picks it up when the pod rolls.'
              }`}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {isNewFile && (
                <Input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder={`filename${fileSet.suffixes[0] ?? ''}`}
                  aria-label="New filename"
                />
              )}

              <AnnotatedAceEditor
                name={`${setName}-editor`}
                mode={aceModeForFile(selectedName, fileSet.language)}
                height="480px"
                value={content}
                onChange={setDraft}
                downloadFileName={selectedName || undefined}
              />

              {writeMessage && (
                <NotificationCard
                  type="error"
                  icon={<IconAlertTriangle />}
                  title={writeMessage}
                />
              )}
              {writeResult && (
                <>
                  <ValidationFeedback validation={writeResult.validation} />
                  <WriteResultFeedback result={writeResult} />
                </>
              )}
              {dryRunMessage && (
                <NotificationCard type="error" title={dryRunMessage} />
              )}
              {dryRunResult && <DryRunResult result={dryRunResult} />}

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  icon={<IconPlayerPlay />}
                  loading={isDryRunning}
                  disabled={!selectedName}
                  onClick={() =>
                    dryRun({
                      name: selectedName,
                      content,
                      // Empty means the instance itself, which for a
                      // source-bound app IS the source.
                      source: '',
                      limit: 10,
                    })
                  }
                >
                  Dry run
                </Button>
                <RbacProtected
                  action={RbacProtected.rbacActions.helmvars_write}
                >
                  <RbacProtected.Unrestricted>
                    {!isNewFile && (
                      <Button
                        danger
                        icon={<IconTrash />}
                        loading={isDeleting}
                        onClick={() => deleteFile(selectedName)}
                      >
                        Delete
                      </Button>
                    )}
                    <Button
                      type="primary"
                      loading={isWriting}
                      disabled={!selectedName}
                      onClick={() => writeFile({ content })}
                    >
                      Commit file
                    </Button>
                  </RbacProtected.Unrestricted>
                </RbacProtected>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
