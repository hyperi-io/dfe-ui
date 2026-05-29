import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandTeams = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-teams" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 7h10v10H3zM6 10h4M8 10v4" /><path d="M8.104 17c.47 2.274 2.483 4 4.896 4a5 5 0 0 0 5-5V9h-5M18 18a4 4 0 0 0 4-4V9h-4" /><path d="M13.003 8.83a3 3 0 1 0-1.833-1.833" /><path d="M15.83 8.36a2.5 2.5 0 1 0 .594-4.117" /></svg>;
const Memo = memo(IconBrandTeams);
export default Memo;