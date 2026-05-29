import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconRepeatOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-repeat-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 12V9a3 3 0 0 1 2.08-2.856M10 6h10m-3-3 3 3-3 3M20 12v3a3 3 0 0 1-.133.886m-1.99 1.984A3 3 0 0 1 17 18H4m3 3-3-3 3-3M3 3l18 18" /></svg>;
const Memo = memo(IconRepeatOff);
export default Memo;