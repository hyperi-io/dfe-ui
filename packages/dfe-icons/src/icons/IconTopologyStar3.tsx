import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTopologyStar3 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-topology-star-3" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 19a2 2 0 1 0-4 0 2 2 0 0 0 4 0M18 5a2 2 0 1 0-4 0 2 2 0 0 0 4 0M10 5a2 2 0 1 0-4 0 2 2 0 0 0 4 0M6 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0M18 19a2 2 0 1 0-4 0 2 2 0 0 0 4 0M14 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0M22 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0M6 12h4M14 12h4M15 7l-2 3M9 7l2 3M11 14l-2 3M13 14l2 3" /></svg>;
const Memo = memo(IconTopologyStar3);
export default Memo;