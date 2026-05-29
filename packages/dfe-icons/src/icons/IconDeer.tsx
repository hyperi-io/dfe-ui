import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDeer = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-deer" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 3c0 2 1 3 4 3q3 0 3 3M21 3c0 2-1 3-4 3-2 0-3 .333-3 3M12 18c-1 0-4-3-4-6q0-3 4-3c4 0 4 1 4 3 0 3-3 6-4 6" /><path d="m15.185 14.889.095-.18a4 4 0 1 1-6.56 0M17 3q0 2-1 3M7 3q0 2 1 3M7 6Q3 7 2 9M17 6q4 1 5 3M8.5 10 7 9M15.5 10 17 9M12 15h.01" /></svg>;
const Memo = memo(IconDeer);
export default Memo;