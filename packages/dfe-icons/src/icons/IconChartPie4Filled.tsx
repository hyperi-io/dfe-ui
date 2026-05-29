import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconChartPie4Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-chart-pie-4" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m11.844 13.57 4.843 7.264a10 10 0 0 1-11.015-1.09zm6.507 6.154L13.87 13h8.081a10 10 0 0 1-3.348 6.511zM11.001 2.05v9.534l-6.744 6.744A10 10 0 0 1 2 12l.005-.324A10 10 0 0 1 11 2.05m6 1.29A10 10 0 0 1 21.95 11H13V2.05a10 10 0 0 1 4 1.29" /></svg>;
const Memo = memo(IconChartPie4Filled);
export default Memo;