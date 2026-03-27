import { AceEditor } from '@/core/components/AceEditor';
import { IconAlertCircle, IconChevronRight } from '@repo/dfe-icons';
import { Ace } from 'ace-builds';
import { useState } from 'react';

import { cn } from '@/core/utils/style';

import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';

import { Splitter as AntdSplitter, Button } from 'antd';

type Annotation = Ace.Annotation;

export const TransformAceEditor = ({
  ...props
}: React.ComponentProps<typeof AceEditor>) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const hasErrors = annotations.some(
    (annotation) => annotation.type === 'error',
  );

  const hasWarnings = annotations.some(
    (annotation) => annotation.type === 'warning',
  );
  return (
    <>
      <AntdSplitter className="[&_.ant-splitter-bar]:px-2">
        <AntdSplitter.Panel>
          <div className="relative flex w-full h-full gap-x-2">
            {(hasErrors || hasWarnings) && (
              <Button
                className={cn(
                  'absolute top-2 right-2 z-100',
                  !hasErrors && hasWarnings && 'bg-warning',
                )}
                aria-label="View lint errors"
                type="primary"
                shape="circle"
                size="small"
                icon={
                  !showAnnotations ? <IconAlertCircle /> : <IconChevronRight />
                }
                danger={hasErrors}
                onClick={() => setShowAnnotations(!showAnnotations)}
              />
            )}
            <AceEditor
              onValidate={(annotations) => setAnnotations(annotations)}
              {...props}
              mode="javascript"
            />
          </div>
        </AntdSplitter.Panel>
        {showAnnotations && (hasErrors || hasWarnings) && (
          <AntdSplitter.Panel min="20%" max="60%" defaultSize="20%">
            <div className="min-h-full p-4 bg-dark-background text-dark-foreground">
              <ul>
                {annotations.map((annotation, index) => (
                  <li
                    key={`annotation-${index}-${annotation.row}-${annotation.column}`}
                  >
                    <dl className="inline-flex font-mono gap-x-2">
                      <dt
                        className={cn(
                          annotation.type === 'error' && 'text-error',
                          annotation.type === 'warning' && 'text-warning',
                          'text-sm font-semibold capitalize',
                        )}
                      >
                        {annotation.type}:
                      </dt>
                      <dd className="text-sm whitespace-wrap">
                        {annotation.text} at line/column {annotation.row}:
                        {annotation.column}
                      </dd>
                    </dl>
                  </li>
                ))}
              </ul>
            </div>
          </AntdSplitter.Panel>
        )}
      </AntdSplitter>
    </>
  );
};
