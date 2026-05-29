import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMicroscopeOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-microscope-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M5 21h14M6 18h2M7 18v3M10 10l-1 1 3 3 1-1m2-2 3-3-3-3-3 3M10.5 12.5 9 14M17 3l3 3M12 21a6 6 0 0 0 5.457-3.505m.441-3.599a6 6 0 0 0-2.183-3.608M3 3l18 18" /></svg>;
const Memo = memo(IconMicroscopeOff);
export default Memo;