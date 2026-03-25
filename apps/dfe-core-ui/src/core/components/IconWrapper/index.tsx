import { cn } from '@/core/utils/style';
import type { IconComponent } from '@repo/dfe-icons';
import { cloneElement } from 'react';

interface IconWrapperProps extends React.HTMLAttributes<SVGElement> {
  icon: React.ReactElement<
    IconComponent & { className?: string; width?: number; height?: number }
  >;
  spin?: boolean; // Old ant-design/icon prop
  color?: string;
  size?: number;
}

/** IconWrapper wraps the icon to allow for Antd compatibility.
 * @param icon - The icon to wrap.
 * @param className - The class name to apply to the icon.
 * @param spin - Whether to spin the icon. (Old ant-design/icon prop)
 * @param color - The color to apply to the icon.
 * @param props - Any other props to apply to the icon.
 * @returns The wrapped icon.
 */
export const IconWrapper = ({
  icon,
  className,
  spin = false,
  color,
  size = 16,
  ...props
}: IconWrapperProps) => {
  const colorClass = color ? `text-${color}-500` : '';
  return (
    <span className="inline-flex items-center h-full justify-center m-auto">
      {cloneElement(icon, {
        ...props,
        width: size,
        height: size,
        className: cn(spin && 'animate-spin', colorClass, className),
      })}
    </span>
  );
};
