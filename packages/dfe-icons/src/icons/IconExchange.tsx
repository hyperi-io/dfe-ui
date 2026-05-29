import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconExchange = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-exchange" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0M17 6a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /><path d="M19 8v5a5 5 0 0 1-5 5h-3l3-3m0 6-3-3M5 16v-5a5 5 0 0 1 5-5h3l-3-3m0 6 3-3" /></svg>;
const Memo = memo(IconExchange);
export default Memo;