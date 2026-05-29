import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconChartPie3Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-chart-pie-3" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 20.66a10 10 0 0 1-11.328-.917L12.414 13h9.536A10 10 0 0 1 17 20.66M11 2.05v9.534l-6.743 6.744A10 10 0 0 1 2 12l.005-.324A10 10 0 0 1 11 2.05m6 1.29A10 10 0 0 1 21.95 11H13V2.05a10 10 0 0 1 4 1.29" /></svg>;
const Memo = memo(IconChartPie3Filled);
export default Memo;