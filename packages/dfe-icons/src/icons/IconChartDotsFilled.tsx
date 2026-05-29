import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconChartDotsFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-chart-dots" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M3 2a1 1 0 0 1 1 1v17h17a1 1 0 0 1 .993.883L22 21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1" /><path d="M19 4a3 3 0 1 1-.651 5.93l-2.002 3.202a3 3 0 1 1-4.927.337l-1.378-1.655a3 3 0 1 1 1.538-1.282l1.378 1.654a3 3 0 0 1 1.693-.115l2.002-3.203A3 3 0 0 1 19 4" /></svg>;
const Memo = memo(IconChartDotsFilled);
export default Memo;