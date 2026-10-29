/**
 * Credential and personal-data masking for server log records, matching the
 * scalo logger's field-name rule (scalo-py `scalo.logger.filters`).
 */

export const MASK = '***REDACTED***';
const EMAIL_MASK = '[EMAIL_REDACTED]';
const MAX_DEPTH = 32;

// scalo's SENSITIVE_FIELDS: a name holding any of these, in any case or spelling, is a credential.
const SENSITIVE_TERMS = [
  'password', 'passwd', 'pwd', 'pass', 'passphrase',
  'token', 'bearer', 'apikey', 'secret', 'privatekey', 'accesskey',
  'accountkey', 'azurekey', 'clientkey', 'encryptionkey', 'gcpkey', 'hmackey',
  'integrationkey', 'jwtkey', 'licencekey', 'licensekey', 'masterkey',
  'saslkey', 'sharedkey', 'signingkey', 'sshkey', 'sslkey', 'tlskey',
  'authorization', 'auth', 'jaasconfig', 'headervalue', 'headersvalue',
  'session', 'cookie', 'csrf', 'certificate', 'cert', 'private',
  'credential', 'creds', 'connectionstring',
  'ssn', 'tfn', 'medicare', 'creditcard', 'cardnumber', 'cvv', 'pin',
  'email', 'phone',
] as const; // prettier-ignore

// A name that says nothing until its parent qualifies it, as `tls` does `key`.
const BARE_NAMES = new Set(['key', 'keys', 'value', 'values']);

const squash = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Whether a field called `name`, held under `parent`, carries a credential. */
export const isCredentialName = (name: string, parent = ''): boolean => {
  const joined = squash(name);
  const subject =
    BARE_NAMES.has(joined) && parent ? squash(parent) + joined : joined;
  return SENSITIVE_TERMS.some((term) => subject.includes(term));
};

const KEY_VALUE =
  /(["']?)([A-Za-z0-9_.-]+)\1(\s*[:=]\s*)("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|(?:Bearer|Basic|SSWS|Token)\s+[^\s,;&}]+|[^\s,;&}]+)/gi;
const BEARER = /\b(Bearer|Basic|SSWS|Token)\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g;
const URL_USERINFO =
  /([a-z][a-z0-9+.-]*:\/\/[^\s:/@]+):[^\s]*@(?=[^\s@]*(?:\s|$))/gi;
const EMAIL = /[A-Za-z0-9._%+-]+(?:@|%40|%2540)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/** Mask credentials and email addresses written into free text. */
export const scrubText = (text: string): string =>
  text
    .replace(URL_USERINFO, `$1:${MASK}@`)
    .replace(BEARER, (_m, scheme: string) => `${scheme} ${MASK}`)
    .replace(JWT, MASK)
    .replace(
      KEY_VALUE,
      (match, quote: string, key: string, sep: string, value: string) => {
        if (!isCredentialName(key)) return match;
        const masked = value.startsWith('"') ? `"${MASK}"` : MASK;
        return `${quote}${key}${quote}${sep}${masked}`;
      },
    )
    .replace(EMAIL, EMAIL_MASK);

/** A JSON-safe copy of `value`, credential keys masked and strings scrubbed at any depth. */
export const scrubValue = (
  value: unknown,
  parent = '',
  depth = 0,
  seen: WeakSet<object> = new WeakSet(),
): unknown => {
  if (typeof value === 'string') return scrubText(value);
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : String(value);
  }
  if (value === null || typeof value === 'boolean') return value;
  if (value === undefined) return null;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Error) {
    return { name: value.name, message: scrubText(value.message) };
  }
  if (typeof value !== 'object') return scrubText(String(value));
  if (depth >= MAX_DEPTH) return '<depth limit>';
  if (seen.has(value)) return '<cycle>';
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, parent, depth + 1, seen));
  }
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = isCredentialName(key, parent)
      ? MASK
      : scrubValue(item, key, depth + 1, seen);
  }
  return out;
};
