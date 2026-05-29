import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHelmetOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-helmet-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8.633 4.654a9 9 0 0 1 11.718 11.7m-1.503 2.486A9 9 0 0 1 17.656 20H6.344a9 9 0 0 1-.185-13.847" /><path d="M20 9h-7m-2.768 1.246q.76 3 3.268 4.254.786.393 1.64.683M3 3l18 18" /></svg>;
const Memo = memo(IconHelmetOff);
export default Memo;