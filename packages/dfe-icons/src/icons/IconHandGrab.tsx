import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHandGrab = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-hand-grab" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 11V7.5a1.5 1.5 0 0 1 3 0V10M11 9.5v-3a1.5 1.5 0 0 1 3 0V10M14 7.5a1.5 1.5 0 0 1 3 0V10" /><path d="M17 9.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-2 .208a6 6 0 0 1-5.012-2.7L7 17q-.468-.718-3.286-5.728A1.5 1.5 0 0 1 4.25 9.25a1.87 1.87 0 0 1 2.28.28L8 11" /></svg>;
const Memo = memo(IconHandGrab);
export default Memo;