import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPlayVolleyball = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-play-volleyball" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0" /><path fill="currentColor" d="M20.5 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" /><path d="m2 16 5 1 .5-2.5M11.5 21l2.5-5.5L8.5 12 12 8l3 4 4 2" /></svg>;
const Memo = memo(IconPlayVolleyball);
export default Memo;