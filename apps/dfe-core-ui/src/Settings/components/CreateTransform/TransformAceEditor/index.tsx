import { AceEditor } from '@/core/components/Editor/AceEditor';
import {
  IconAlertCircle,
  IconChevronRight,
  IconDeviceFloppy,
  IconMenu,
} from '@repo/dfe-icons';
import { Ace } from 'ace-builds';
import { useState } from 'react';

import { cn } from '@/core/utils/style';

import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-rust';
import 'ace-builds/src-noconflict/mode-typescript';

import { Splitter as AntdSplitter, Button, Popover } from 'antd';

type Annotation = Ace.Annotation;

interface TransformAceEditorProps extends React.ComponentProps<
  typeof AceEditor
> {
  downloadFileName?: string;
}

export const TransformAceEditor = ({
  downloadFileName,
  mode,
  ...props
}: TransformAceEditorProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const hasErrors = annotations.some(
    (annotation) => annotation.type === 'error',
  );
  const hasWarnings = annotations.some(
    (annotation) => annotation.type === 'warning',
  );
  const hasInfo = annotations.some((annotation) => annotation.type === 'info');
  const hasAnnotations = hasErrors || hasWarnings || hasInfo;

  const handleSaveFile = () => {
    const blob = new Blob([props.value ?? ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const element = document.createElement('a');

    element.href = url;
    element.download = downloadFileName ?? `new-file[${mode}].txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AntdSplitter className="[&_.ant-splitter-bar]:px-2">
        <AntdSplitter.Panel>
          <div className="relative flex w-full h-full gap-x-2">
            <div className="absolute top-2 right-2 z-100 flex gap-x-2">
              <Popover
                trigger="click"
                placement="left"
                classNames={{
                  container: 'p-1',
                }}
                arrow={false}
                content={
                  <ul>
                    <li>
                      <Button
                        type="text"
                        icon={<IconDeviceFloppy />}
                        onClick={() => handleSaveFile()}
                        size="small"
                        className="w-full"
                      >
                        Save to Desktop
                      </Button>
                    </li>
                  </ul>
                }
              >
                <Button
                  type="default"
                  shape="circle"
                  size="small"
                  icon={<IconMenu />}
                />
              </Popover>
              {hasAnnotations && (
                <Button
                  className={cn(
                    !hasErrors && hasWarnings && 'bg-warning',
                    !hasErrors && !hasWarnings && !hasInfo && 'bg-info',
                  )}
                  aria-label="View lint errors"
                  type="primary"
                  shape="circle"
                  size="small"
                  icon={
                    !showAnnotations ? (
                      <IconAlertCircle />
                    ) : (
                      <IconChevronRight />
                    )
                  }
                  danger={hasErrors}
                  onClick={() => setShowAnnotations(!showAnnotations)}
                />
              )}
            </div>

            <AceEditor
              name={`${mode}-editor`}
              onValidate={(annotations) => setAnnotations(annotations)}
              mode={mode}
              {...props}
            />
          </div>
        </AntdSplitter.Panel>
        {showAnnotations && hasAnnotations && (
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
