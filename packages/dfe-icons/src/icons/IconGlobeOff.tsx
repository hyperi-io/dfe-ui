import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGlobeOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-globe-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7.353 7.355a4 4 0 0 0 5.29 5.293m2.007-2.009a4 4 0 0 0-5.3-5.284M5.75 15a8.015 8.015 0 0 0 9.792.557m2.02-1.998A8.015 8.015 0 0 0 15 2M11 17v4M7 21h8M3 3l18 18" /></svg>;
const Memo = memo(IconGlobeOff);
export default Memo;