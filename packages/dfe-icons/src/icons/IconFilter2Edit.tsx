import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFilter2Edit = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-filter-2-edit" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 6h16M6 12h11M9 18h2M18.42 15.61a2.09 2.09 0 0 1 1.485-.615 2.1 2.1 0 0 1 1.485.615 2.1 2.1 0 0 1 0 2.97L18 22h-3v-3z" /></svg>;
const Memo = memo(IconFilter2Edit);
export default Memo;