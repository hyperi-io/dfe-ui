import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconContract = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-contract" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 21H6a3 3 0 0 1-3-3v-1h5.5M17 8.5V5a2 2 0 1 1 2 2h-2" /><path d="M19 3H8a3 3 0 0 0-3 3v11M9 7h4M9 11h4M18.42 12.61a2.1 2.1 0 0 1 2.97 2.97L15 22h-3v-3z" /></svg>;
const Memo = memo(IconContract);
export default Memo;