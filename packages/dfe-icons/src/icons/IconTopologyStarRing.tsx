import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTopologyStarRing = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-topology-star-ring" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M14 20a2 2 0 1 0-4 0 2 2 0 0 0 4 0M14 4a2 2 0 1 0-4 0 2 2 0 0 0 4 0M6 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0M22 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0M14 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0M6 12h4M14 12h4M13.5 5.5l5 5M5.5 13.5l5 5M13.5 18.5l5-5M10.5 5.5l-5 5M12 6v4M12 14v4" /></svg>;
const Memo = memo(IconTopologyStarRing);
export default Memo;