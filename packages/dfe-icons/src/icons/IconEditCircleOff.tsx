import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconEditCircleOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-edit-circle-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10.507 10.498 9 12v3h3l1.493-1.498m2-2.01 4.89-4.907a2.1 2.1 0 0 0-2.97-2.97L12.5 8.511M16 5l3 3" /><path d="M7.476 7.471A7 7 0 0 0 10 21a7 7 0 0 0 6.53-4.474M3 3l18 18" /></svg>;
const Memo = memo(IconEditCircleOff);
export default Memo;