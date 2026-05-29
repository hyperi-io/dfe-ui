import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconReplaceOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-replace-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 3h1a1 1 0 0 1 1 1v1m-.303 3.717A1 1 0 0 1 8 9H4a1 1 0 0 1-1-1V4c0-.28.115-.532.3-.714M19 15h1a1 1 0 0 1 1 1v1m-.303 3.717A1 1 0 0 1 20 21h-4a1 1 0 0 1-1-1v-4c0-.28.115-.532.3-.714M21 11V8a2 2 0 0 0-2-2h-6l3 3m0-6-3 3M3 13v3a2 2 0 0 0 2 2h6l-3-3m0 6 3-3M3 3l18 18" /></svg>;
const Memo = memo(IconReplaceOff);
export default Memo;