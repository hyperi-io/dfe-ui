import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBuildingCastle = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-building-castle" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M15 19v-2a3 3 0 0 0-6 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5h4v3h3V5h4v3h3V5h4v14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1M3 11h18" /></svg>;
const Memo = memo(IconBuildingCastle);
export default Memo;