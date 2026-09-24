/**
 * Reject antd imports of components that have project wrappers.
 *
 * Use @/core/components/{Drawer,Form,Table,Modal,Tooltip} instead of importing
 * those names from 'antd'. The wrapper files themselves may still import from antd.
 */

const ERROR = 'error';
const PLUGIN_NAME = 'antd-import-reject';
const RULE_NAME = 'no-wrapped-antd-imports';

const WRAPPED_COMPONENTS = {
  Drawer: '@/core/components/Drawer',
  Form: '@/core/components/Form',
  Table: '@/core/components/Table',
  Modal: '@/core/components/Modal',
  Tooltip: '@/core/components/Tooltip',
  Popover: '@/core/components/Popover',
};

const getImportedName = (specifier) => {
  if (specifier.type !== 'ImportSpecifier') {
    return null;
  }

  const imported = specifier.imported;
  if (imported.type === 'Identifier') {
    return imported.name;
  }
  if (imported.type === 'Literal' && typeof imported.value === 'string') {
    return imported.value;
  }

  return null;
};

const isWrapperFile = (filename, componentName) => {
  const normalized = filename.replaceAll('\\', '/');
  return normalized.includes(`/core/components/${componentName}/`);
};

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing Drawer, Form, Table, Modal, or Tooltip from antd; use the core wrappers.',
    },
    schema: [],
    messages: {
      useWrapper:
        "Do not import '{{name}}' from 'antd'. Use '{{wrapper}}' instead.",
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'antd') {
          return;
        }

        for (const specifier of node.specifiers) {
          const name = getImportedName(specifier);
          const wrapper = name ? WRAPPED_COMPONENTS[name] : undefined;
          if (!wrapper || isWrapperFile(filename, name)) {
            continue;
          }

          context.report({
            node: specifier,
            messageId: 'useWrapper',
            data: { name, wrapper },
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

/** Rule ID for wrapped antd import rejection. */
export const RULE_ID = `${PLUGIN_NAME}/${RULE_NAME}`;

/** ESLint config overrides that reject wrapped antd component imports. */
export const antdImportRejectOverrides = [
  {
    plugins: {
      [PLUGIN_NAME]: plugin,
    },
    rules: {
      [RULE_ID]: ERROR,
    },
  },
];
