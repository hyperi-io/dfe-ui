import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSpeedboat = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-speedboat" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M2 17h14.4a3 3 0 0 0 2.5-1.34L22 11h-6.23a4 4 0 0 0-1.49.29l-3.56 1.42a4 4 0 0 1-1.49.29H3.5zM6 13l1.5-5" /><path d="M6 8h8l2 3" /></svg>;
const Memo = memo(IconSpeedboat);
export default Memo;