#!/usr/bin/env node
/**
 * Core exports that can move closer to their only caller.
 *
 * A symbol defined under src/core is drift when production imports reach it
 * from exactly one top-level src directory other than core, and from no
 * non-test file inside core. It belongs in that directory. An export used by
 * core, or by two or more of those directories, stays: core is the shared
 * kernel, and core is not allowed to import a feature scope.
 *
 * Co-located core tests, stories, and mocks do not count as core usage, or
 * every component would look used by core. Feature tests do count as that
 * feature using the symbol.
 *
 * Exit 1 when any move candidate exists. Unused exports are listed with
 * --unused and do not affect the exit code.
 *
 *   node scripts/import-scope-drift.mjs
 *   node scripts/import-scope-drift.mjs --unused
 *   node scripts/import-scope-drift.mjs --json
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const APP_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../apps/dfe-core-ui',
);
const SRC_ROOT = path.join(APP_ROOT, 'src');

/** Same exclusions as eslint/import-scope.mjs: not feature scopes. */
const NOT_A_FEATURE = new Set(['core', 'types']);

const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');
const showUnused = args.has('--unused');

const sourceFiles = [];

const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      sourceFiles.push(full);
    }
  }
};

walk(SRC_ROOT);

const fileSet = new Set(sourceFiles);

const isTestFile = (file) =>
  /\.(test|spec|stories|mocks)\.(ts|tsx)$/.test(file);

const scopeOf = (file) => {
  const [top] = path.relative(SRC_ROOT, file).split(path.sep);
  if (!top || top.includes('.')) return '(root)';
  return top;
};

const hasModifier = (node, kind) =>
  node.modifiers?.some((modifier) => modifier.kind === kind) ?? false;

const isExported = (node) => hasModifier(node, ts.SyntaxKind.ExportKeyword);
const isDefaultExport = (node) =>
  hasModifier(node, ts.SyntaxKind.DefaultKeyword);

const declarationKind = (node) => {
  if (ts.isFunctionDeclaration(node)) return 'function';
  if (ts.isClassDeclaration(node)) return 'class';
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isEnumDeclaration(node)) return 'enum';
  if (ts.isVariableDeclaration(node)) return 'const';
  return 'value';
};

const resolveSpecifier = (fromFile, specifier) => {
  if (specifier.startsWith('@/')) {
    return resolveBase(path.join(SRC_ROOT, specifier.slice(2)));
  }
  if (specifier.startsWith('.')) {
    return resolveBase(path.resolve(path.dirname(fromFile), specifier));
  }
  return null;
};

const resolveBase = (base) => {
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ];
  return candidates.find((candidate) => fileSet.has(candidate)) ?? null;
};

const collectBindingNames = (name, into) => {
  if (ts.isIdentifier(name)) {
    into.push(name.text);
    return;
  }
  if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    for (const element of name.elements) {
      if (ts.isBindingElement(element)) collectBindingNames(element.name, into);
    }
  }
};

/** @type {Map<string, { imports: { specifier: string, namespace: boolean, names: { imported: string }[], sideEffect: boolean }[], explicit: Map<string, { type: 'local', kind: string, localName?: string } | { type: 'reexport', specifier: string, imported: string }>, stars: string[] }>} */
const parsed = new Map();

for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8');
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const imports = [];
  const explicit = new Map();
  const stars = [];
  const importBindings = new Map();
  const localKinds = new Map();

  const visit = (node) => {
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text;
      const clause = node.importClause;
      const names = [];
      if (!clause) {
        imports.push({ specifier, namespace: false, names, sideEffect: true });
      } else {
        if (clause.name) {
          names.push({ imported: 'default' });
          importBindings.set(clause.name.text, {
            specifier,
            imported: 'default',
          });
        }
        const bindings = clause.namedBindings;
        if (bindings && ts.isNamespaceImport(bindings)) {
          imports.push({ specifier, namespace: true, names, sideEffect: false });
        } else if (bindings && ts.isNamedImports(bindings)) {
          for (const element of bindings.elements) {
            const imported = (element.propertyName ?? element.name).text;
            names.push({ imported });
            importBindings.set(element.name.text, { specifier, imported });
          }
          imports.push({
            specifier,
            namespace: false,
            names,
            sideEffect: false,
          });
        } else if (clause.name) {
          imports.push({
            specifier,
            namespace: false,
            names,
            sideEffect: false,
          });
        }
      }
    } else if (ts.isExportDeclaration(node)) {
      const specifier =
        node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
          ? node.moduleSpecifier.text
          : null;
      if (!specifier && node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          const local = (element.propertyName ?? element.name).text;
          const exported = element.name.text;
          const binding = importBindings.get(local);
          if (binding) {
            explicit.set(exported, {
              type: 'reexport',
              specifier: binding.specifier,
              imported: binding.imported,
            });
          } else {
            explicit.set(exported, {
              type: 'local',
              kind: 'value',
              localName: local,
            });
          }
        }
      } else if (
        specifier &&
        node.exportClause &&
        ts.isNamedExports(node.exportClause)
      ) {
        for (const element of node.exportClause.elements) {
          explicit.set(element.name.text, {
            type: 'reexport',
            specifier,
            imported: (element.propertyName ?? element.name).text,
          });
        }
      } else if (specifier && !node.exportClause) {
        stars.push(specifier);
      }
    } else if (ts.isExportAssignment(node)) {
      explicit.set('default', { type: 'local', kind: 'default' });
    } else if (
      (ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isEnumDeclaration(node)) &&
      node.name
    ) {
      localKinds.set(node.name.text, declarationKind(node));
      if (isExported(node)) {
        explicit.set(isDefaultExport(node) ? 'default' : node.name.text, {
          type: 'local',
          kind: declarationKind(node),
          localName: node.name.text,
        });
      }
    } else if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        const names = [];
        collectBindingNames(declaration.name, names);
        for (const name of names) localKinds.set(name, 'const');
        if (isExported(node)) {
          for (const name of names) {
            explicit.set(name, { type: 'local', kind: 'const', localName: name });
          }
        }
      }
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      imports.push({
        specifier: node.arguments[0].text,
        namespace: true,
        names: [],
        sideEffect: false,
      });
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  for (const entry of explicit.values()) {
    if (entry.type === 'local' && entry.localName && localKinds.has(entry.localName)) {
      entry.kind = localKinds.get(entry.localName);
    }
  }

  parsed.set(file, { imports, explicit, stars });
}

const resolvedExport = new Map();
const exportNameCache = new Map();

const resolveExport = (file, name, seen = new Set()) => {
  const key = `${file}#${name}`;
  if (resolvedExport.has(key)) return resolvedExport.get(key);
  if (seen.has(key)) return null;
  seen.add(key);

  const info = parsed.get(file);
  let found = null;
  const explicit = info?.explicit.get(name);
  if (explicit?.type === 'local') {
    found = { file, name, kind: explicit.kind };
  } else if (explicit?.type === 'reexport') {
    const target = resolveSpecifier(file, explicit.specifier);
    found = target ? resolveExport(target, explicit.imported, seen) : null;
  } else if (info) {
    for (const specifier of info.stars) {
      const target = resolveSpecifier(file, specifier);
      if (!target) continue;
      const starHit = resolveExport(target, name, seen);
      if (starHit && name !== 'default') {
        found = starHit;
        break;
      }
    }
  }

  resolvedExport.set(key, found);
  return found;
};

const exportNames = (file, seen = new Set()) => {
  if (exportNameCache.has(file)) return exportNameCache.get(file);
  if (seen.has(file)) return [];
  seen.add(file);
  const info = parsed.get(file);
  const names = new Set(info ? info.explicit.keys() : []);
  for (const specifier of info?.stars ?? []) {
    const target = resolveSpecifier(file, specifier);
    if (!target) continue;
    for (const name of exportNames(target, seen)) {
      if (name !== 'default') names.add(name);
    }
  }
  const list = [...names];
  exportNameCache.set(file, list);
  return list;
};

/** @type {Map<string, { file: string, name: string, kind: string, byScope: Map<string, Set<string>>, testOnlyCore: boolean }>} */
const symbols = new Map();

const symbolKey = (defined) => `${defined.file}#${defined.name}`;

const noteUse = (defined, importer) => {
  if (!defined || !defined.file.startsWith(path.join(SRC_ROOT, 'core') + path.sep)) {
    return;
  }
  if (defined.file === importer) return;
  const key = symbolKey(defined);
  let record = symbols.get(key);
  if (!record) {
    record = {
      file: defined.file,
      name: defined.name,
      kind: defined.kind,
      byScope: new Map(),
      testOnlyCore: false,
    };
    symbols.set(key, record);
  }
  const scope = scopeOf(importer);
  if (scope === 'core' && isTestFile(importer)) {
    record.testOnlyCore = true;
    return;
  }
  const files = record.byScope.get(scope) ?? new Set();
  files.add(importer);
  record.byScope.set(scope, files);
};

for (const file of sourceFiles) {
  for (const statement of parsed.get(file).imports) {
    const target = resolveSpecifier(file, statement.specifier);
    if (!target) continue;
    if (statement.namespace) {
      for (const name of exportNames(target)) {
        noteUse(resolveExport(target, name), file);
      }
      continue;
    }
    for (const { imported } of statement.names) {
      noteUse(resolveExport(target, imported), file);
    }
  }
}

for (const file of sourceFiles) {
  if (!file.startsWith(path.join(SRC_ROOT, 'core') + path.sep)) continue;
  for (const name of parsed.get(file).explicit.keys()) {
    const defined = resolveExport(file, name);
    if (!defined || defined.file !== file) continue;
    if (!symbols.has(symbolKey(defined))) {
      symbols.set(symbolKey(defined), {
        file: defined.file,
        name: defined.name,
        kind: defined.kind,
        byScope: new Map(),
        testOnlyCore: false,
      });
    }
  }
}

const rel = (file) => path.relative(APP_ROOT, file);

const featureScopes = (record) =>
  [...record.byScope.keys()].filter((scope) => !NOT_A_FEATURE.has(scope));

const moves = [];
const unused = [];

for (const record of symbols.values()) {
  const features = featureScopes(record);
  const usedByCore = record.byScope.has('core');
  if (!usedByCore && features.length === 1) {
    const scope = features[0];
    moves.push({
      name: record.name,
      kind: record.kind,
      file: rel(record.file),
      scope,
      importers: [...record.byScope.get(scope)].map(rel).sort(),
    });
    continue;
  }
  if (!usedByCore && features.length === 0) {
    unused.push({
      name: record.name,
      kind: record.kind,
      file: rel(record.file),
      testsOnly: record.testOnlyCore,
    });
  }
}

moves.sort(
  (a, b) =>
    a.scope.localeCompare(b.scope) ||
    a.file.localeCompare(b.file) ||
    a.name.localeCompare(b.name),
);
unused.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name));

if (asJson) {
  const payload = { moves };
  if (showUnused) payload.unused = unused;
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log(
    'Core exports used by exactly one feature scope, and not by core. Move each into that scope.',
  );
  console.log(`${moves.length} to move.`);
  let current = '';
  for (const move of moves) {
    if (move.scope !== current) {
      current = move.scope;
      console.log(`\n${current} (${moves.filter((item) => item.scope === current).length})`);
    }
    console.log(`  ${move.file}`);
    console.log(
      `    ${move.name}  ${move.kind}  ${move.importers.length} importer${move.importers.length === 1 ? '' : 's'}`,
    );
    for (const importer of move.importers) {
      console.log(`      ${importer}`);
    }
  }
  if (showUnused) {
    console.log(
      `\nUnused outside their own file: ${unused.length} (${unused.filter((item) => item.testsOnly).length} referenced only by core tests).`,
    );
    for (const item of unused) {
      console.log(
        `  ${item.file}  ${item.name}  ${item.kind}${item.testsOnly ? '  tests-only' : ''}`,
      );
    }
  } else {
    console.log(
      `\n${unused.length} exports have no production importers. Pass --unused to list them.`,
    );
  }
}

process.exit(moves.length > 0 ? 1 : 0);
