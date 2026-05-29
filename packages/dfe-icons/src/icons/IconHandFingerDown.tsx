import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHandFingerDown = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-hand-finger-down" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 12v8.5a1.5 1.5 0 0 0 3 0V13M11 13.5v2a1.5 1.5 0 0 0 3 0V13M14 14.5a1.5 1.5 0 0 0 3 0V13" /><path d="M17 13.5a1.5 1.5 0 0 0 3 0V9a6 6 0 0 0-6-6h-2 .208a6 6 0 0 0-5.012 2.7L7 6q-.468.718-3.286 5.728a1.5 1.5 0 0 0 .536 2.022c.734.44 1.674.325 2.28-.28L8 12" /></svg>;
const Memo = memo(IconHandFingerDown);
export default Memo;