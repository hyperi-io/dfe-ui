import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTractor = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-tractor" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 15a4 4 0 1 0 8 0 4 4 0 1 0-8 0M7 15v.01M17 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M10.5 17H17" /><path d="M20 15.2V11a1 1 0 0 0-1-1h-6l-2-5H5v6.5" /><path d="M18 5h-1a1 1 0 0 0-1 1v4" /></svg>;
const Memo = memo(IconTractor);
export default Memo;