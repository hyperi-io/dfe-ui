import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPlayBasketball = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-play-basketball" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0M5 21l3-3 .75-1.5M14 21v-4l-4-3 .5-6" /><path d="m5 12 1-3 4.5-1 3.5 3 4 1" /><path fill="currentColor" d="M18.5 16a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" /></svg>;
const Memo = memo(IconPlayBasketball);
export default Memo;