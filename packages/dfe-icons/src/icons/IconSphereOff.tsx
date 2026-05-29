import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSphereOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-sphere-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 12c0 1.657 4.03 3 9 3 .987 0 1.936-.053 2.825-.15m3.357-.67C19.917 13.633 21 12.86 21 12" /><path d="M20.051 16.027A9 9 0 0 0 7.968 3.952m-2.34 1.692a9 9 0 0 0 12.74 12.716M3 3l18 18" /></svg>;
const Memo = memo(IconSphereOff);
export default Memo;