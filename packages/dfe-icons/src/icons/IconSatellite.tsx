import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSatellite = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-satellite" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m3.707 6.293 2.586-2.586a1 1 0 0 1 1.414 0l5.586 5.586a1 1 0 0 1 0 1.414l-2.586 2.586a1 1 0 0 1-1.414 0L3.707 7.707a1 1 0 0 1 0-1.414" /><path d="m6 10-3 3 3 3 3-3M10 6l3-3 3 3-3 3M12 12l1.5 1.5M14.5 17a2.5 2.5 0 0 0 2.5-2.5M15 21a6 6 0 0 0 6-6" /></svg>;
const Memo = memo(IconSatellite);
export default Memo;