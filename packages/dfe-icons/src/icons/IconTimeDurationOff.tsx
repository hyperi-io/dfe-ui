import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTimeDurationOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-time-duration-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 12v.01M7.5 19.8v.01M4.2 16.5v.01M4.2 7.5v.01M12 21a9 9 0 0 0 6.362-2.634m1.685-2.336A9 9 0 0 0 12 3M3 3l18 18" /></svg>;
const Memo = memo(IconTimeDurationOff);
export default Memo;