import { isValidElement, type ReactNode } from 'react';

const textFromReactNode = (node: ReactNode): string => {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textFromReactNode).join('');
  }
  if (!isValidElement(node)) {
    return '';
  }
  const props = node.props as { title?: string; children?: ReactNode };
  if (typeof props.title === 'string') {
    return props.title;
  }
  return textFromReactNode(props.children);
};

export const getColumnTitleText = (title: unknown): string => {
  if (title == null || typeof title === 'function') {
    return '';
  }
  if (typeof title === 'string' || typeof title === 'number') {
    return String(title);
  }
  return textFromReactNode(title as ReactNode);
};
