import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconRippleOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-ripple-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 7q1.372-.915 2.746-1.272m4.212.22Q10.978 6.318 12 7q4.5 3 9 0M3 17q4.5-3 9 0 3.138 2.093 6.276 1.266M3 12q4.5-3 9 0m5.482 1.429Q19.241 13.173 21 12M3 3l18 18" /></svg>;
const Memo = memo(IconRippleOff);
export default Memo;