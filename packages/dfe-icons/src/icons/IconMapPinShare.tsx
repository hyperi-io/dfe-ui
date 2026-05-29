import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMapPinShare = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-map-pin-share" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0" /><path d="M12.02 21.485a2 2 0 0 1-1.433-.585l-4.244-4.243a8 8 0 1 1 13.403-3.651M16 22l5-5M21 21.5V17h-4.5" /></svg>;
const Memo = memo(IconMapPinShare);
export default Memo;