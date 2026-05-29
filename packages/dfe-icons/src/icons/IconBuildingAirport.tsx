import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBuildingAirport = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-building-airport" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3.59 7h8.82a1 1 0 0 1 .902 1.433l-1.44 3a1 1 0 0 1-.901.567H5.029a1 1 0 0 1-.901-.567l-1.44-3A1 1 0 0 1 3.589 7" /><path d="m6 7-.78-2.342A.5.5 0 0 1 5.693 4h4.612a.5.5 0 0 1 .475.658L10 7M8 2v2M6 12v9h4v-9M3 21h18M22 5h-6l-1-1" /><path d="m18 3 2 2-2 2M10 17h7a2 2 0 0 1 2 2v2" /></svg>;
const Memo = memo(IconBuildingAirport);
export default Memo;