import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconServerOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-server-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 12H6a3 3 0 0 1-3-3V7c0-1.083.574-2.033 1.435-2.56M8 4h10a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-2M16 12h2a3 3 0 0 1 3 3v2m-1.448 2.568A3 3 0 0 1 18 20H6a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h6M7 8v.01M7 16v.01M3 3l18 18" /></svg>;
const Memo = memo(IconServerOff);
export default Memo;