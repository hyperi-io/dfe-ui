/*
 * Adapted from json-view-cn, registry/json-view/json-view.tsx at commit
 * 12aef1be4ffbad806d4fba8ca5d4481025c657c8 (https://github.com/mnove/json-view-cn).
 * Icons come from @repo/dfe-icons, tooltips from antd, colours from the dfe-ui
 * tokens, and every node carries its key path so a caller can hang actions on it.
 *
 * MIT License
 *
 * Copyright (c) 2026 Marcello Novelli
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use client';

import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import {
  IconCheck,
  IconChevronRight,
  IconChevronUp,
  IconCopy,
  IconDots,
} from '@repo/dfe-icons';
import { useCallback, useState, type ReactNode } from 'react';

type JsonPrimitive = string | number | boolean | null;
type JsonValueType = JsonPrimitive | JsonObjectType | JsonArrayType;
type JsonObjectType = { [key: string]: JsonValueType };
type JsonArrayType = JsonValueType[];

export type JsonViewPath = readonly (string | number)[];

export interface JsonViewNode {
  /** Keys from the root down to this node; array positions are numbers. */
  path: JsonViewPath;
  value: unknown;
}

export interface JsonViewTheme {
  key?: string;
  string?: string;
  number?: string;
  boolean?: string;
  null?: string;
  bracket?: string;
  lineHover?: string;
}

const defaultTheme: Required<JsonViewTheme> = {
  key: 'text-secondary dark:text-tertiary',
  string: 'text-green-700 dark:text-green-400',
  number: 'text-orange-700 dark:text-amber-400',
  boolean: 'text-purple-700 dark:text-purple-400',
  null: 'text-foreground-muted dark:text-dark-foreground-muted italic',
  bracket: 'text-foreground dark:text-dark-foreground',
  lineHover:
    'hover:bg-background-muted dark:hover:bg-dark-background-secondary/50',
};

const MUTED_ICON =
  'size-3 text-foreground-muted dark:text-dark-foreground-muted';
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-tertiary/50';

export interface JsonViewProps {
  data: unknown;
  className?: string;
  defaultExpanded?: boolean;
  initialDepth?: number;
  indentGuide?: boolean;
  theme?: JsonViewTheme;
  rootName?: string;
  stringTruncate?: number;
  /** Controls rendered after a node's value, beside its copy button. */
  renderActions?: (node: JsonViewNode) => ReactNode;
  /** Extra classes for a node's key label, such as a selection highlight. */
  keyClassName?: (node: JsonViewNode) => string | undefined;
}

interface InternalProps {
  indentGuide: boolean;
  theme: Required<JsonViewTheme>;
  initialDepth: number;
  stringTruncate: number;
  renderActions?: (node: JsonViewNode) => ReactNode;
  keyClassName?: (node: JsonViewNode) => string | undefined;
}

function isObject(value: unknown): value is JsonObjectType {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is JsonArrayType {
  return Array.isArray(value);
}

function summaryNoun(isArr: boolean, count: number): string {
  if (isArr) return count === 1 ? 'item' : 'items';
  return count === 1 ? 'key' : 'keys';
}

// Values that are not plain JSON take the shape JSON.stringify would give them:
// toJSON where defined (Date), Map as an object, Set as an array.
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
  // The ancestor chain turns a circular reference into "[Circular]" rather than a throw.
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

function CopyButton({ value }: { value: unknown }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(stringifyValue(value))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  }, [value]);

  return (
    <Tooltip title={copied ? 'Copied' : 'Copy'} placement="top">
      <button
        type="button"
        aria-label={copied ? 'Copied' : 'Copy value'}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm p-1',
          'opacity-0 transition-opacity group-hover/line:opacity-100 focus-visible:opacity-100',
          FOCUS_RING,
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleCopy();
        }}
      >
        {copied ? (
          <IconCheck className="size-3 text-success" />
        ) : (
          <IconCopy className={MUTED_ICON} />
        )}
      </button>
    </Tooltip>
  );
}

function NodeActions({
  node,
  internal,
}: {
  node: JsonViewNode;
  internal: InternalProps;
}) {
  const actions = internal.renderActions?.(node);
  if (actions === null || actions === undefined || actions === false) {
    return null;
  }
  return <span className="inline-flex shrink-0 items-center">{actions}</span>;
}

function JsonLine({
  depth,
  node,
  children,
  className,
  internal,
}: {
  depth: number;
  node: JsonViewNode;
  children: ReactNode;
  className?: string;
  internal: InternalProps;
}) {
  return (
    <div
      className={cn(
        'group/line flex items-center gap-1 rounded-sm rounded-l-none leading-6',
        internal.theme.lineHover,
        className,
      )}
      style={{ paddingLeft: depth * 24 }}
    >
      <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
      <NodeActions node={node} internal={internal} />
      <CopyButton value={node.value} />
    </div>
  );
}

function Bracket({
  children,
  theme,
}: {
  children: ReactNode;
  theme: Required<JsonViewTheme>;
}) {
  return <span className={cn('font-semibold', theme.bracket)}>{children}</span>;
}

function Comma({ theme }: { theme: Required<JsonViewTheme> }) {
  return <span className={theme.bracket}>,</span>;
}

// JSON.stringify's escaping without the surrounding quotes, so embedded quotes,
// backslashes and control characters display as they are stored.
function escapeString(value: string): string {
  return JSON.stringify(value).slice(1, -1);
}

function KeyLabel({
  name,
  node,
  internal,
}: {
  name: string;
  node: JsonViewNode;
  internal: InternalProps;
}) {
  const { theme } = internal;
  return (
    <span className="whitespace-pre-wrap">
      <span
        className={cn('rounded-sm', theme.key, internal.keyClassName?.(node))}
      >
        &quot;{escapeString(name)}&quot;
      </span>
      <span className={theme.bracket}>: </span>
    </span>
  );
}

function StringValue({
  value,
  theme,
}: {
  value: string;
  theme: Required<JsonViewTheme>;
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
  theme: Required<JsonViewTheme>;
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
        <Tooltip
          title={value}
          placement="bottom"
          classNames={{ root: 'max-w-xs wrap-break-word whitespace-pre-wrap' }}
        >
          <span>{escapeString(value.substring(0, truncate))}&hellip;</span>
        </Tooltip>
      )}
      &quot;
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse string' : 'Expand string'}
        className={cn(
          'ml-1 inline-flex cursor-pointer rounded-sm align-middle opacity-0 transition-opacity',
          'group-hover/truncated:opacity-100 focus-visible:opacity-100',
          FOCUS_RING,
        )}
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((prev) => !prev);
        }}
      >
        {expanded ? (
          <IconChevronUp className={MUTED_ICON} />
        ) : (
          <IconDots className={MUTED_ICON} />
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
  theme: Required<JsonViewTheme>;
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

  // A symbol renders without quotes so it is not mistaken for a string.
  return <span className={theme.null}>{String(value)}</span>;
}

function CollapsibleNode({
  value,
  keyName,
  path,
  depth,
  absoluteDepth,
  isLast,
  internal,
  ancestors,
}: {
  value: JsonObjectType | JsonArrayType;
  keyName?: string;
  path: JsonViewPath;
  depth: number;
  absoluteDepth: number;
  isLast: boolean;
  internal: InternalProps;
  ancestors: readonly object[];
}) {
  const shouldExpand =
    internal.initialDepth === Infinity
      ? true
      : absoluteDepth < internal.initialDepth;

  const [expanded, setExpanded] = useState(shouldExpand);

  const { theme, indentGuide } = internal;
  const node: JsonViewNode = { path, value };
  const isArr = isArray(value);
  const entries = isArr
    ? value.map((v, i) => [i, v] as const)
    : Object.entries(value);
  const openBracket = isArr ? '[' : '{';
  const closeBracket = isArr ? ']' : '}';
  const isEmpty = entries.length === 0;
  const childAncestors = [...ancestors, value];

  if (isEmpty) {
    return (
      <JsonLine depth={depth} node={node} internal={internal}>
        {keyName !== undefined && (
          <KeyLabel name={keyName} node={node} internal={internal} />
        )}
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
          className={cn(
            'flex min-w-0 cursor-pointer items-center rounded-sm text-left',
            FOCUS_RING,
          )}
          onClick={() => setExpanded((e) => !e)}
        >
          <span className="mr-1 inline-flex shrink-0 items-center justify-center p-0.5">
            <IconChevronRight
              className={cn(
                'size-3.5 text-foreground-muted transition-transform duration-150 dark:text-dark-foreground-muted',
                expanded && 'rotate-90',
              )}
            />
          </span>
          <span className="min-w-0 [overflow-wrap:anywhere]">
            {keyName !== undefined && (
              <KeyLabel name={keyName} node={node} internal={internal} />
            )}
            <Bracket theme={theme}>{openBracket}</Bracket>
            {!expanded && (
              <span className="ml-1 text-xs text-foreground-muted dark:text-dark-foreground-muted">
                &hellip;{entries.length} {summaryNoun(isArr, entries.length)}
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
        <NodeActions node={node} internal={internal} />
        <CopyButton value={value} />
      </div>

      {expanded && (
        <div
          className={cn(
            indentGuide &&
              'border-l border-foreground-muted/20 transition-colors hover:border-foreground-muted/40 dark:border-dark-foreground-muted/20',
          )}
          style={{ marginLeft: depth * 24 + 10 }}
        >
          {entries.map(([key, childValue], idx) => (
            <JsonNode
              key={String(key)}
              value={childValue}
              keyName={isArr ? undefined : String(key)}
              path={[...path, key]}
              depth={1}
              absoluteDepth={absoluteDepth + 1}
              isLast={idx === entries.length - 1}
              internal={internal}
              ancestors={childAncestors}
            />
          ))}
        </div>
      )}

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
  path,
  depth,
  absoluteDepth,
  isLast,
  internal,
  ancestors,
}: {
  value: unknown;
  keyName?: string;
  path: JsonViewPath;
  depth: number;
  absoluteDepth: number;
  isLast: boolean;
  internal: InternalProps;
  ancestors: readonly object[];
}) {
  const value = resolveValue(rawValue);
  const node: JsonViewNode = { path, value };

  if (isObject(value) || isArray(value)) {
    if (ancestors.includes(value)) {
      return (
        <JsonLine depth={depth} node={node} internal={internal}>
          {keyName !== undefined && (
            <KeyLabel name={keyName} node={node} internal={internal} />
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
        path={path}
        depth={depth}
        absoluteDepth={absoluteDepth}
        isLast={isLast}
        internal={internal}
        ancestors={ancestors}
      />
    );
  }

  return (
    <JsonLine depth={depth} node={node} internal={internal}>
      {keyName !== undefined && (
        <KeyLabel name={keyName} node={node} internal={internal} />
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

export function JsonView({
  data,
  className,
  defaultExpanded = true,
  initialDepth,
  indentGuide = true,
  theme: themeOverride,
  rootName,
  stringTruncate = 0,
  renderActions,
  keyClassName,
}: JsonViewProps) {
  const theme: Required<JsonViewTheme> = { ...defaultTheme, ...themeOverride };

  const resolvedInitialDepth =
    initialDepth !== undefined ? initialDepth : defaultExpanded ? Infinity : 0;

  const internal: InternalProps = {
    indentGuide,
    theme,
    initialDepth: resolvedInitialDepth,
    stringTruncate,
    renderActions,
    keyClassName,
  };

  return (
    <div className={cn('font-mono text-sm', className)}>
      <JsonNode
        value={data}
        keyName={rootName}
        path={[]}
        depth={0}
        absoluteDepth={0}
        isLast
        internal={internal}
        ancestors={[]}
      />
    </div>
  );
}
