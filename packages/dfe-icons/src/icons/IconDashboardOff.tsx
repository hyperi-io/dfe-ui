import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDashboardOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-dashboard-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M11.175 11.178a2 2 0 1 0 2.653 2.634M14.5 10.5l1-1" /><path d="M8.621 4.612a9 9 0 0 1 11.721 11.72m-1.516 2.488A9 9 0 0 1 17.6 20H6.4a9 9 0 0 1-.268-13.87M3 3l18 18" /></svg>;
const Memo = memo(IconDashboardOff);
export default Memo;