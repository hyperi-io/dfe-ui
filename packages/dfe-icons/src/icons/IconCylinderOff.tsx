import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCylinderOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-cylinder-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M5.23 5.233C5.08 5.478 5 5.735 5 6c0 1.131 1.461 2.117 3.62 2.628m4.357.343C16.381 8.767 19 7.515 19 6c0-1.657-3.134-3-7-3-1.645 0-3.158.243-4.353.65" /><path d="M5 6v12c0 1.657 3.134 3 7 3 3.245 0 5.974-.946 6.767-2.23M19 15V6M3 3l18 18" /></svg>;
const Memo = memo(IconCylinderOff);
export default Memo;