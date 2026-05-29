import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTreadmill = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-treadmill" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 3a1 1 0 1 0 2 0 1 1 0 0 0-2 0M3 14l4 1 .5-.5M12 18v-3l-3-2.923L9.75 7" /><path d="M6 10V8l4-1 2.5 2.5 2.5.5M21 22a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1M18 21l1-11 2-1" /></svg>;
const Memo = memo(IconTreadmill);
export default Memo;