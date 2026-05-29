import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconChartRadar = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-chart-radar" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m12 3 9.5 7L18 21H6L2.5 10z" /><path d="m12 7.5 5.5 4L15 17H8.5l-2-5.5z" /><path d="m2.5 10 9.5 3 9.5-3" /><path d="M12 3v10l6 8M6 21l6-8" /></svg>;
const Memo = memo(IconChartRadar);
export default Memo;