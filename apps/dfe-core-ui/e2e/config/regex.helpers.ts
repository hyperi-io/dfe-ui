const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * A pattern from a template whose interpolations match literally, so a test
 * value holding `.`, `(` or `+` still finds its own row. The template's
 * backslashes stay raw: rx`\s${name}\s`.
 */
export const rx = (strings: TemplateStringsArray, ...values: string[]) =>
  // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp -- the values are the test's own data, escaped above
  new RegExp(
    strings.raw.reduce(
      (pattern, part, i) =>
        pattern + part + (i < values.length ? escapeRegExp(values[i]) : ''),
      '',
    ),
  );
