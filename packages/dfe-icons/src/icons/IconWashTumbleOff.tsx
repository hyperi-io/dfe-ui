import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWashTumbleOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-wash-tumble-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M20.116 20.127A3 3 0 0 1 18 21H6a3 3 0 0 1-3-3V6c0-.827.335-1.576.877-2.12M7 3h11a3 3 0 0 1 3 3v11" /><path d="M17.744 13.74a6 6 0 0 0-7.486-7.482M7.759 7.755a6 6 0 1 0 8.48 8.49M3 3l18 18" /></svg>;
const Memo = memo(IconWashTumbleOff);
export default Memo;