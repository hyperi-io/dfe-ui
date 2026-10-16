'use client';

import {
  IconCheck,
  IconChevronRight,
  IconChevronUp,
  IconCopy,
} from '@repo/dfe-icons';
import { Tooltip, cn } from '@repo/dfe-shared-ui';
import { useCallback, useState } from 'react';
import { useJsonViewerContext } from './context';

type JsonPrimitive = string | number | boolean | null;
type JsonValueType = JsonPrimitive | JsonObjectType | JsonArrayType;
type JsonObjectType = { [key: string]: JsonValueType };
type JsonArrayType = JsonValueType[];

interface JsonViewerTheme {
  key?: string;
  string?: string;
  number?: string;
  boolean?: string;
  null?: string;
  bracket?: string;
  lineHover?: string;
}

const defaultTheme: Required<JsonViewerTheme> = {
  key: 'jv-key',
  string: 'jv-string',
  number: 'jv-number',
  boolean: 'jv-boolean',
  null: 'jv-null',
  bracket: 'jv-bracket',
  lineHover: 'jv-line',
};

interface JsonViewerProps {
  data: unknown;
  className?: string;
  defaultExpanded?: boolean;
  initialDepth?: number;
  indentGuide?: boolean;
  theme?: JsonViewerTheme;
  rootName?: string;
  stringTruncate?: number;
}

interface InternalProps {
  indentGuide: boolean;
  theme: Required<JsonViewerTheme>;
  initialDepth: number;
  stringTruncate: number;
}

function isObject(value: unknown): value is JsonObjectType {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is JsonArrayType {
  return Array.isArray(value);
}

function childFieldPath(
  parent: string | undefined,
  key: string | number,
): string {
  const segment = String(key);
  return parent ? `${parent}.${segment}` : segment;
}

// Resolve values that are not plain JSON into the closest JSON-like shape,
// mirroring what JSON.stringify would do where it is defined: objects with
// toJSON (Date, custom classes) use it, Map becomes an object, Set an array.
function resolveValue(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (typeof (value as { toJSON?: unknown }).toJSON === 'function') {
    return (value as { toJSON: () => unknown }).toJSON();
  }
  if (value instanceof Map) {
    return Object.fromEntries(Array.from(value, ([k, v]) => [String(k), v]));
  }
  if (value instanceof Set) return Array.from(value);
  return value;
}

function stringifyValue(value: unknown): string {
  if (typeof value === 'string') return value;
  // Track the ancestor chain so circular references become "[Circular]"
  // instead of throwing. `this` inside the replacer is the parent object.
  const ancestors: unknown[] = [];
  return JSON.stringify(
    value,
    function (this: unknown, _key, val) {
      while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) {
        ancestors.pop();
      }
      const resolved = resolveValue(val);
      if (typeof resolved === 'bigint') {
        const asNumber = Number(resolved);
        return Number.isSafeInteger(asNumber) ? asNumber : resolved.toString();
      }
      if (resolved !== null && typeof resolved === 'object') {
        if (ancestors.includes(resolved)) return '[Circular]';
        ancestors.push(resolved);
      }
      return resolved;
    },
    2,
  );
}

function ActionButton({
  value,
  level,
  fieldPath,
}: {
  value: unknown;
  level: number;
  fieldPath: string;
}) {
  const { action: ActionComponent } = useJsonViewerContext();
  return (
    <div className="inline-flex shrink-0" onClick={(e) => e.stopPropagation()}>
      {ActionComponent && (
        <ActionComponent fieldPath={fieldPath} level={level} value={value} />
      )}
    </div>
  );
}

function CopyButton({ value }: { value: unknown }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = stringifyValue(value);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  return (
    <div className="inline-flex shrink-0" onClick={(e) => e.stopPropagation()}>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}>
        <button
          aria-label={copied ? 'Copied' : 'Copy value'}
          className="jv-copy"
          type="button"
          onClick={handleCopy}
        >
          {copied ? <IconCheck /> : <IconCopy />}
        </button>
      </Tooltip>
    </div>
  );
}

function JsonLine({
  depth,
  value,
  children,
  className,
  theme,
  fieldPath,
}: {
  depth: number;
  value: unknown;
  children: React.ReactNode;
  className?: string;
  theme: Required<JsonViewerTheme>;
  fieldPath?: string;
}) {
  return (
    <div
      className={cn(
        'group/line flex items-center gap-1 rounded-sm rounded-l-none leading-6',
        theme.lineHover,
        className,
      )}
      style={{ paddingLeft: depth * 24 }}
    >
      <span className="min-w-0 wrap-anywhere">{children}</span>
      {fieldPath !== undefined && (
        <ActionButton value={value} level={depth} fieldPath={fieldPath} />
      )}
      <CopyButton value={value} />
    </div>
  );
}

function Bracket({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Required<JsonViewerTheme>;
}) {
  return <span className={cn('font-semibold', theme.bracket)}>{children}</span>;
}

function Comma({ theme }: { theme: Required<JsonViewerTheme> }) {
  return <span className={theme.bracket}>,</span>;
}

// Escape a string the way JSON.stringify would, without the surrounding quotes,
// so embedded quotes, backslashes, and control characters display faithfully.
function escapeString(value: string): string {
  return JSON.stringify(value).slice(1, -1);
}

function KeyLabel({
  name,
  theme,
}: {
  name: string;
  theme: Required<JsonViewerTheme>;
}) {
  return (
    <span className={cn('whitespace-pre-wrap', theme.key)}>
      &quot;{escapeString(name)}&quot;
      <span className={theme.bracket}>: </span>
    </span>
  );
}

function StringValue({
  value,
  theme,
}: {
  value: string;
  theme: Required<JsonViewerTheme>;
}) {
  return (
    <span className={cn('whitespace-pre-wrap', theme.string)}>
      &quot;{escapeString(value)}&quot;
    </span>
  );
}

function TruncatedString({
  value,
  truncate,
  theme,
}: {
  value: string;
  truncate: number;
  theme: Required<JsonViewerTheme>;
}) {
  const [expanded, setExpanded] = useState(false);

  if (value.length <= truncate) {
    return <StringValue value={value} theme={theme} />;
  }

  return (
    <span
      className={cn(
        'group/truncated cursor-pointer whitespace-pre-wrap',
        theme.string,
      )}
      onClick={(e) => {
        e.stopPropagation();
        setExpanded((prev) => !prev);
      }}
    >
      &quot;
      {expanded ? (
        escapeString(value)
      ) : (
        <Tooltip placement="bottom" title={value}>
          <span>{escapeString(value.substring(0, truncate))}&hellip;</span>
        </Tooltip>
      )}
      &quot;
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse string' : 'Expand string'}
        className="ml-1 inline-flex cursor-pointer rounded-sm align-middle opacity-0 transition-opacity outline-none group-hover/truncated:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((prev) => !prev);
        }}
      >
        {expanded ? (
          <IconChevronUp className="size-3 text-muted-foreground" />
        ) : (
          <IconChevronRight className="size-3 text-muted-foreground" />
        )}
      </button>
    </span>
  );
}

function JsonPrimitiveValue({
  value,
  theme,
  stringTruncate,
}: {
  value: unknown;
  theme: Required<JsonViewerTheme>;
  stringTruncate: number;
}) {
  if (value === null) {
    return <span className={theme.null}>null</span>;
  }

  if (value === undefined) {
    return <span className={theme.null}>undefined</span>;
  }

  if (typeof value === 'boolean') {
    return <span className={theme.boolean}>{String(value)}</span>;
  }

  if (typeof value === 'number') {
    return <span className={theme.number}>{String(value)}</span>;
  }

  if (typeof value === 'string') {
    if (stringTruncate > 0) {
      return (
        <TruncatedString
          value={value}
          truncate={stringTruncate}
          theme={theme}
        />
      );
    }

    return <StringValue value={value} theme={theme} />;
  }

  if (typeof value === 'bigint') {
    return <span className={theme.number}>{value.toString()}</span>;
  }

  if (typeof value === 'function') {
    return (
      <span className={theme.null}>
        [Function{value.name ? `: ${value.name}` : ''}]
      </span>
    );
  }

  // Remaining non-JSON primitives (symbol): render without quotes so they
  // are not mistaken for strings.
  return <span className={theme.null}>{String(value)}</span>;
}

function CollapsibleNode({
  value,
  keyName,
  depth,
  absoluteDepth,
  isLast,
  internal,
  ancestors,
  fieldPath,
}: {
  value: JsonObjectType | JsonArrayType;
  keyName?: string;
  depth: number;
  absoluteDepth: number;
  isLast: boolean;
  internal: InternalProps;
  ancestors: readonly object[];
  fieldPath?: string;
}) {
  const shouldExpand =
    internal.initialDepth === Infinity
      ? true
      : absoluteDepth < internal.initialDepth;

  const [expanded, setExpanded] = useState(shouldExpand);

  const { theme, indentGuide } = internal;
  const isArr = isArray(value);
  const entries = isArr
    ? value.map((v, i) => [i, v] as const)
    : Object.entries(value);
  const openBracket = isArr ? '[' : '{';
  const closeBracket = isArr ? ']' : '}';
  const isEmpty = entries.length === 0;
  const childAncestors = [...ancestors, value];

  // Empty containers render inline
  if (isEmpty) {
    return (
      <JsonLine depth={depth} value={value} theme={theme} fieldPath={fieldPath}>
        {keyName !== undefined && <KeyLabel name={keyName} theme={theme} />}
        <Bracket theme={theme}>
          {openBracket}
          {closeBracket}
        </Bracket>
        {!isLast && <Comma theme={theme} />}
      </JsonLine>
    );
  }

  return (
    <div>
      {/* Opening line */}
      <div
        className={cn(
          'group/line flex items-center gap-1 rounded-sm rounded-l-none leading-6',
          theme.lineHover,
        )}
        style={{ paddingLeft: depth * 24 }}
      >
        <button
          type="button"
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 cursor-pointer items-center rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => setExpanded((e) => !e)}
        >
          <span className="mr-1 inline-flex shrink-0 items-center justify-center p-0.5 text-muted-foreground">
            <IconChevronRight
              className={cn(
                'size-3.5 transition-transform duration-150',
                expanded && 'rotate-90',
              )}
            />
          </span>
          <span className="min-w-0 wrap-anywhere">
            {keyName !== undefined && <KeyLabel name={keyName} theme={theme} />}
            <Bracket theme={theme}>{openBracket}</Bracket>
            {!expanded && (
              <span className="ml-1 text-xs text-muted-foreground">
                {isArr
                  ? `\u2026${entries.length} items`
                  : `\u2026${entries.length} keys`}
              </span>
            )}
            {!expanded && (
              <>
                <Bracket theme={theme}>{closeBracket}</Bracket>
                {!isLast && <Comma theme={theme} />}
              </>
            )}
          </span>
        </button>

        {fieldPath !== undefined && (
          <ActionButton value={value} level={depth} fieldPath={fieldPath} />
        )}
        <CopyButton value={value} />
      </div>

      {/* Children with indent guide */}
      {expanded && (
        <div
          className={cn(
            indentGuide &&
              'border-l border-muted-foreground/20 transition-colors hover:border-muted-foreground/40',
          )}
          style={{ marginLeft: depth * 24 + 10 }}
        >
          {entries.map(([key, childValue], idx) => (
            <JsonNode
              key={String(key)}
              value={childValue}
              keyName={isArr ? undefined : String(key)}
              depth={1}
              absoluteDepth={absoluteDepth + 1}
              isLast={idx === entries.length - 1}
              internal={internal}
              ancestors={childAncestors}
              fieldPath={childFieldPath(fieldPath, key)}
            />
          ))}
        </div>
      )}

      {/* Closing bracket */}
      {expanded && (
        <div className="leading-6" style={{ paddingLeft: depth * 24 }}>
          <span className="ml-5">
            <Bracket theme={theme}>{closeBracket}</Bracket>
            {!isLast && <Comma theme={theme} />}
          </span>
        </div>
      )}
    </div>
  );
}

function JsonNode({
  value: rawValue,
  keyName,
  depth,
  absoluteDepth,
  isLast,
  internal,
  ancestors,
  fieldPath,
}: {
  value: unknown;
  keyName?: string;
  depth: number;
  absoluteDepth: number;
  isLast: boolean;
  internal: InternalProps;
  ancestors: readonly object[];
  fieldPath?: string;
}) {
  const value = resolveValue(rawValue);

  if (isObject(value) || isArray(value)) {
    if (ancestors.includes(value)) {
      return (
        <JsonLine
          depth={depth}
          value={value}
          theme={internal.theme}
          fieldPath={fieldPath}
        >
          {keyName !== undefined && (
            <KeyLabel name={keyName} theme={internal.theme} />
          )}
          <span className={internal.theme.null}>[Circular]</span>
          {!isLast && <Comma theme={internal.theme} />}
        </JsonLine>
      );
    }

    return (
      <CollapsibleNode
        value={value}
        keyName={keyName}
        depth={depth}
        absoluteDepth={absoluteDepth}
        isLast={isLast}
        internal={internal}
        ancestors={ancestors}
        fieldPath={fieldPath}
      />
    );
  }

  return (
    <JsonLine
      depth={depth}
      value={value}
      theme={internal.theme}
      fieldPath={fieldPath}
    >
      {keyName !== undefined && (
        <KeyLabel name={keyName} theme={internal.theme} />
      )}
      <JsonPrimitiveValue
        value={value}
        theme={internal.theme}
        stringTruncate={internal.stringTruncate}
      />
      {!isLast && <Comma theme={internal.theme} />}
    </JsonLine>
  );
}

function JsonViewer({
  data,
  className,
  defaultExpanded = true,
  initialDepth,
  indentGuide = true,
  theme: themeOverride,
  rootName,
  stringTruncate = 0,
}: JsonViewerProps) {
  const theme: Required<JsonViewerTheme> = {
    ...defaultTheme,
    ...themeOverride,
  };

  const resolvedInitialDepth =
    initialDepth !== undefined ? initialDepth : defaultExpanded ? Infinity : 0;

  const internal: InternalProps = {
    indentGuide,
    theme,
    initialDepth: resolvedInitialDepth,
    stringTruncate,
  };

  const content = (
    <JsonNode
      value={data}
      keyName={rootName}
      depth={0}
      absoluteDepth={0}
      isLast
      internal={internal}
      ancestors={[]}
    />
  );

  return <div className={cn('font-mono text-sm', className)}>{content}</div>;
}

export { JsonViewer };
export type { JsonViewerProps, JsonViewerTheme };
