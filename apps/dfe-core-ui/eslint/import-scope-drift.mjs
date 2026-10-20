/**
 * ESLint warning for core exports that belong in one feature scope.
 *
 * Same moves as scripts/import-scope-drift.mjs. Warnings only: a drifted
 * export does not fail lint.
 */

import path from 'node:path';
import { APP_ROOT, moves } from '../../../scripts/import-scope-drift.mjs';

const PLUGIN_NAME = 'import-scope-drift';
const RULE_NAME = 'single-scope';

const appRelative = (filename) => {
  const absolute = path.isAbsolute(filename)
    ? filename
    : path.resolve(APP_ROOT, filename);
  const relative = path.relative(APP_ROOT, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return relative.split(path.sep).join('/');
};

const idName = (node) => {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  return null;
};

const bindingNodes = (id) => {
  if (!id) return [];
  if (id.type === 'Identifier') return [id];
  if (id.type === 'ObjectPattern') {
    return id.properties.flatMap((prop) => {
      if (prop.type === 'RestElement') return bindingNodes(prop.argument);
      if (prop.type === 'Property') return bindingNodes(prop.value);
      return [];
    });
  }
  if (id.type === 'ArrayPattern') {
    return id.elements.flatMap((element) => {
      if (!element) return [];
      if (element.type === 'RestElement') return bindingNodes(element.argument);
      return bindingNodes(element);
    });
  }
  if (id.type === 'AssignmentPattern') return bindingNodes(id.left);
  return [];
};

const declarationNodes = (declaration) => {
  if (!declaration) return [];
  if (declaration.type === 'VariableDeclaration') {
    return declaration.declarations.flatMap((item) => bindingNodes(item.id));
  }
  if (declaration.id) return bindingNodes(declaration.id);
  return [];
};

const findExportNode = (program, name) => {
  for (const statement of program.body) {
    if (statement.type === 'ExportDefaultDeclaration' && name === 'default') {
      return statement;
    }
    if (statement.type !== 'ExportNamedDeclaration') continue;
    for (const node of declarationNodes(statement.declaration)) {
      if (idName(node) === name) return node;
    }
    for (const specifier of statement.specifiers ?? []) {
      if (idName(specifier.exported) === name) return specifier.exported;
    }
  }
  return program;
};

const movesByFile = new Map();
for (const move of moves) {
  const file = move.file.split(path.sep).join('/');
  const list = movesByFile.get(file) ?? [];
  list.push(move);
  movesByFile.set(file, list);
}

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn when a core export is used by exactly one feature scope and not by core.',
    },
    schema: [],
    messages: {
      moveToScope:
        "'{{name}}' is only used by {{scope}}. Move it into that scope.",
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const relative = appRelative(filename);
    const fileMoves = relative ? (movesByFile.get(relative) ?? []) : [];
    if (fileMoves.length === 0) return {};

    return {
      Program(node) {
        for (const move of fileMoves) {
          context.report({
            node: findExportNode(node, move.name),
            messageId: 'moveToScope',
            data: { name: move.name, scope: move.scope },
          });
        }
      },
    };
  },
};

const plugin = {
  meta: { name: PLUGIN_NAME },
  rules: {
    [RULE_NAME]: rule,
  },
};

/** Rule ID for single-scope core exports. */
export const RULE_ID = `${PLUGIN_NAME}/${RULE_NAME}`;

/** ESLint config override. Severity is warning, so drift does not fail lint. */
export const importScopeDriftOverrides = [
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      [PLUGIN_NAME]: plugin,
    },
    rules: {
      [RULE_ID]: 'warn',
    },
  },
];
