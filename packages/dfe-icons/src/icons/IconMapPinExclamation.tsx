import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMapPinExclamation = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-map-pin-exclamation" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0" /><path d="m15.005 19.31-1.591 1.59a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 13.592-4.638M19 16v3M19 22v.01" /></svg>;
const Memo = memo(IconMapPinExclamation);
export default Memo;