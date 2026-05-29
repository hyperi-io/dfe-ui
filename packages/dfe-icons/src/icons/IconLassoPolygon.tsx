import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLassoPolygon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-lasso-polygon" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4.028 13.252 3 10l2-7 7 5 8-3 1 9-9 3-5.144-1.255" /><path d="M3 15a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /><path d="M5 17c0 1.42.316 2.805 1 4" /></svg>;
const Memo = memo(IconLassoPolygon);
export default Memo;