import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSteeringWheelOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-steering-wheel-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M20.04 16.048A9 9 0 0 0 7.957 3.958m-2.32 1.678a9 9 0 1 0 12.737 12.719" /><path d="M10.595 10.576a2 2 0 1 0 2.827 2.83M12 14v7M10 12l-6.75-2M15.542 11.543 20.75 10M3 3l18 18" /></svg>;
const Memo = memo(IconSteeringWheelOff);
export default Memo;