import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconZoomReplace = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-zoom-replace" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m21 21-6-6M3.291 8a7 7 0 0 1 5.077-4.806 7.02 7.02 0 0 1 8.242 4.403" /><path d="M17 4v4h-4M16.705 12a7 7 0 0 1-5.074 4.798 7.02 7.02 0 0 1-8.241-4.403" /><path d="M3 16v-4h4" /></svg>;
const Memo = memo(IconZoomReplace);
export default Memo;