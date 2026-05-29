import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHandFingerLeft = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-hand-finger-left" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 8H3.5a1.5 1.5 0 0 0 0 3H11M10.5 11h-2a1.5 1.5 0 1 0 0 3H11M9.5 14a1.5 1.5 0 0 0 0 3H11" /><path d="M10.5 17a1.5 1.5 0 0 0 0 3H15a6 6 0 0 0 6-6v-2 .208a6 6 0 0 0-2.7-5.012L18 7q-.718-.468-5.728-3.286a1.5 1.5 0 0 0-2.022.536 1.87 1.87 0 0 0 .28 2.28L12 8" /></svg>;
const Memo = memo(IconHandFingerLeft);
export default Memo;