import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWheelchair = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-wheelchair" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 16a5 5 0 1 0 10 0 5 5 0 1 0-10 0M17 19a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /><path d="M19 17a3 3 0 0 0-3-3h-3.4M3 3h1a2 2 0 0 1 2 2v6M6 8h11M15 8v6" /></svg>;
const Memo = memo(IconWheelchair);
export default Memo;