import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconEscalatorUp = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-escalator-up" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M19.5 7h-2.672a2 2 0 0 0-1.414.586L7 16H4.5a2.5 2.5 0 1 0 0 5h3.672a2 2 0 0 0 1.414-.586L18 12h1.5a2.5 2.5 0 1 0 0-5M6 10V3M3 6l3-3 3 3" /></svg>;
const Memo = memo(IconEscalatorUp);
export default Memo;