import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconViewportShort = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-viewport-short" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 3v7l3-3M9 7l3 3M12 21v-7l3 3M9 17l3-3M18 9h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1M6 9H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1" /></svg>;
const Memo = memo(IconViewportShort);
export default Memo;