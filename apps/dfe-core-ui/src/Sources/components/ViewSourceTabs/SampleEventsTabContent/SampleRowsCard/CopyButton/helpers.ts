const resolveValue = (value: unknown): unknown => {
  if (value === null || typeof value !== 'object') return value;
  if (typeof (value as { toJSON?: unknown }).toJSON === 'function') {
    return (value as { toJSON: () => unknown }).toJSON();
  }
  if (value instanceof Map) {
    return Object.fromEntries(Array.from(value, ([k, v]) => [String(k), v]));
  }
  if (value instanceof Set) return Array.from(value);
  return value;
};

export const stringifyValue = (value: unknown): string => {
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
};
