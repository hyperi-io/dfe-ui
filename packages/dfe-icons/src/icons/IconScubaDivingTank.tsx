import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconScubaDivingTank = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-scuba-diving-tank" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 11a4 4 0 1 1 8 0v5H8zM8 16v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3M9 4h6M12 7V4M7 4a1 1 0 1 0 2 0 1 1 0 1 0-2 0" /><path fill="currentColor" d="M11.5 4a.5.5 0 1 0 1 0 .5.5 0 1 0-1 0" /></svg>;
const Memo = memo(IconScubaDivingTank);
export default Memo;