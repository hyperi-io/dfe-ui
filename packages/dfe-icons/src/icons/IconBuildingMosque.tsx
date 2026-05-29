import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBuildingMosque = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-building-mosque" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 21h7v-2a2 2 0 1 1 4 0v2h7M4 21V11M20 21V11M4 16h3v-3h10v3h3M17 13a5 5 0 0 0-10 0M21 10.5c0-.329-.077-.653-.224-.947L20 8l-.776 1.553A2.1 2.1 0 0 0 19 10.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5M5 10.5c0-.329-.077-.653-.224-.947L4 8l-.776 1.553A2.1 2.1 0 0 0 3 10.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5M12 2a2 2 0 1 0 2 2M12 6v2" /></svg>;
const Memo = memo(IconBuildingMosque);
export default Memo;