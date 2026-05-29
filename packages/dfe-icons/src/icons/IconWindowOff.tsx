import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWindowOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-window-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M6.166 6.19A6.9 6.9 0 0 0 5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1m0-4v-5c0-3.728-3.134-7-7-7a6.86 6.86 0 0 0-3.804 1.158M5 13h8m4 0h2M12 3v5m0 4v9M3 3l18 18" /></svg>;
const Memo = memo(IconWindowOff);
export default Memo;