import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconChartFunnelFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-chart-funnel" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m17.72 16-1.315 3.948A3 3 0 0 1 13.558 22h-3.116a3 3 0 0 1-2.847-2.052L6.28 16zm2-6-1.333 4H5.613L4.28 10zm-.106-8a2 2 0 0 1 1.896 2.632L20.387 8H3.613L2.49 4.632a2 2 0 0 1 1.72-2.624L4.387 2z" /></svg>;
const Memo = memo(IconChartFunnelFilled);
export default Memo;