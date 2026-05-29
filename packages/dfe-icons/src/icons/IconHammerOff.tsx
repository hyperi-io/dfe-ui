import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHammerOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-hammer-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10.698 10.72 4.03 17.418a2.09 2.09 0 0 0 0 2.967 2.11 2.11 0 0 0 2.976 0l6.696-6.676M18.713 14.702l2-2a1 1 0 0 0 0-1.414l-7.586-7.586a1 1 0 0 0-1.414 0l-2 2M3 3l18 18" /></svg>;
const Memo = memo(IconHammerOff);
export default Memo;