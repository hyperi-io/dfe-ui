import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLollipopOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-lollipop-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7.462 7.493a7 7 0 0 0 9.06 9.039m2.416-1.57a7 7 0 1 0-9.884-9.915" /><path d="M21 10a3.5 3.5 0 0 0-7 0M12.71 12.715A3.5 3.5 0 0 1 7 10M14 17c.838 0 1.607-.294 2.209-.785M17.5 13.5A3.5 3.5 0 0 0 14 10M14 3a3.5 3.5 0 0 0-3.5 3.5M3 21l6-6M3 3l18 18" /></svg>;
const Memo = memo(IconLollipopOff);
export default Memo;