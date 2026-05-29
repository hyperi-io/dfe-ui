import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTimeDuration45 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-time-duration-45" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M13 15h2a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-2V9h3M7 9v2a1 1 0 0 0 1 1h1M10 9v6M7.5 4.2v.01M4.2 7.5v.01" /><path d="M3 12a9 9 0 1 0 9-9" /></svg>;
const Memo = memo(IconTimeDuration45);
export default Memo;