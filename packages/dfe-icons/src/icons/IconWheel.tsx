import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWheel = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-wheel" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" /><path d="M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M3 12h6M15 12h6M13.6 9.4 17 4.6M10.4 14.6 7 19.4M7 4.6l3.4 4.8M13.6 14.6l3.4 4.8" /></svg>;
const Memo = memo(IconWheel);
export default Memo;