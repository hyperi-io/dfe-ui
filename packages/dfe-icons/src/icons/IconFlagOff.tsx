import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFlagOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-flag-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M5 5v16M19 5v9M7.641 3.645A5 5 0 0 1 12 5a5 5 0 0 0 7 0M5 14a5 5 0 0 1 7 0 4.98 4.98 0 0 0 3.437 1.429m3.019-.966q.285-.21.544-.463M3 3l18 18" /></svg>;
const Memo = memo(IconFlagOff);
export default Memo;