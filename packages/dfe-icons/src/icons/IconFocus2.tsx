import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFocus2 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-focus-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path fill="currentColor" d="M11.5 12a.5.5 0 1 0 1 0 .5.5 0 1 0-1 0" /><path d="M5 12a7 7 0 1 0 14 0 7 7 0 1 0-14 0M12 3v2M3 12h2M12 19v2M19 12h2" /></svg>;
const Memo = memo(IconFocus2);
export default Memo;