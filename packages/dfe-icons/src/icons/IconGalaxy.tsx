import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGalaxy = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-galaxy" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 3q-2 1.5-2 4.5c0 3 2 4.5 2 4.5s2 1.5 2 4.5q0 3-2 4.5" /><path d="M19.794 16.5q-.3-2.482-2.897-3.982C14.3 11.018 12 12 12 12s-2.299.982-4.897-.518Q4.505 9.982 4.206 7.5" /><path d="M19.794 7.5q-2.299-.982-4.897.518C12.3 9.518 12 12 12 12s-.299 2.482-2.897 3.982q-2.598 1.5-4.897.518" /></svg>;
const Memo = memo(IconGalaxy);
export default Memo;