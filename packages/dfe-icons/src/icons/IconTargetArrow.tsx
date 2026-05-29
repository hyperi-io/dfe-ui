import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTargetArrow = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-target-arrow" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M11 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0" /><path d="M12 7a5 5 0 1 0 5 5" /><path d="M13 3.055A9 9 0 1 0 20.941 11" /><path d="M15 6v3h3l3-3h-3V3zM15 9l-3 3" /></svg>;
const Memo = memo(IconTargetArrow);
export default Memo;