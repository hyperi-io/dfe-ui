import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconChartDots3Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-chart-dots-3" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M18 2a4 4 0 1 1-3.843 5.114L7.862 7.9a3 3 0 0 1-.094.257l6.446 4.431a3 3 0 1 1-.695 4.099l-3.527 1.058Q10 17.872 10 18a4 4 0 1 1-8 0l.005-.2a4 4 0 0 1 7.366-1.954l3.64-1.094.01-.102q.023-.204.074-.4l-6.688-4.6A3 3 0 0 1 2 7l.005-.176a3 3 0 0 1 5.784-.931l6.312-.79A4 4 0 0 1 18 2" /></svg>;
const Memo = memo(IconChartDots3Filled);
export default Memo;