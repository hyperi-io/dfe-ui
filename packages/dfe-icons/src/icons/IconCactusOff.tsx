import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCactusOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-cactus-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M6 9v1a3 3 0 0 0 3 3h1M18 8v5a3 3 0 0 1-.129.872m-2.014 2a3 3 0 0 1-.857.124h-1M10 21V10m0-4V5a2 2 0 1 1 4 0v5m0 4v7M7 21h10M3 3l18 18" /></svg>;
const Memo = memo(IconCactusOff);
export default Memo;