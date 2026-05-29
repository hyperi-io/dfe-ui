import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArmchair2Off = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-armchair-2-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M5 10V6a3 3 0 0 1 .128-.869m2.038-2.013Q7.564 3.001 8 3h8a3 3 0 0 1 3 3v4" /><path d="M16.124 12.145a3 3 0 1 1 3.756 3.724M19 19H5v-3a3 3 0 1 1 3-3v2M8 12h4M7 19v2M17 19v2M3 3l18 18" /></svg>;
const Memo = memo(IconArmchair2Off);
export default Memo;