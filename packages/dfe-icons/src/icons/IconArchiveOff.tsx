import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArchiveOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-archive-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 4h11a2 2 0 1 1 0 4h-7M8 8H5a2 2 0 0 1-.826-3.822" /><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 1.824-1.18M19 15V8M10 12h2M3 3l18 18" /></svg>;
const Memo = memo(IconArchiveOff);
export default Memo;