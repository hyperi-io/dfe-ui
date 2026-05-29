import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTimeDuration5 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-time-duration-5" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 15h2a1.5 1.5 0 0 0 0-3h-2V9h3.5M3 12v.01M21 12v.01M12 21v.01M7.5 4.2v.01M16.5 19.8v.01M7.5 19.8v.01M4.2 16.5v.01M19.8 16.5v.01M19.8 7.5v.01M4.2 7.5v.01M16.5 4.206A9.04 9.04 0 0 0 12 3" /></svg>;
const Memo = memo(IconTimeDuration5);
export default Memo;