import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDeviceAirpods = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-device-airpods" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M6 4a4 4 0 0 1 4 3.8v10.7a1.5 1.5 0 0 1-3 0V12H6a4 4 0 0 1-4-3.8V8a4 4 0 0 1 4-4M18 4a4 4 0 0 0-4 3.8v10.7a1.5 1.5 0 0 0 3 0V12h1a4 4 0 0 0 4-3.8V8a4 4 0 0 0-4-4" /></svg>;
const Memo = memo(IconDeviceAirpods);
export default Memo;