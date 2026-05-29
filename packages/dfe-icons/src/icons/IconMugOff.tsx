import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMugOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-mug-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9 5h5.917A1.08 1.08 0 0 1 16 6.077V12m-.167 3.88A4.33 4.33 0 0 1 11.667 19H7.333C4.94 19 3 17.071 3 14.692V6.077A1.08 1.08 0 0 1 4.083 5H5M16 8h2.5c1.38 0 2.5 1.045 2.5 2.333v2.334c0 1.148-.89 2.103-2.06 2.297M3 3l18 18" /></svg>;
const Memo = memo(IconMugOff);
export default Memo;