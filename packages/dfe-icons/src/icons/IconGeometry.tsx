import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGeometry = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-geometry" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m7 21 4-12m2 0 1.48 4.439m.949 2.847L17 21M10 7a2 2 0 1 0 4 0 2 2 0 1 0-4 0M4 12c1.526 2.955 4.588 5 8 5 3.41 0 6.473-2.048 8-5M12 5V3" /></svg>;
const Memo = memo(IconGeometry);
export default Memo;