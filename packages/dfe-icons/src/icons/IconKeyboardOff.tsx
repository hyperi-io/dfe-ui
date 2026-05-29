import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconKeyboardOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-keyboard-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M18 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2m4 0h10a2 2 0 0 1 2 2v8c0 .554-.226 1.056-.59 1.418M6 10v.01M10 10v.01M14 10v.01M18 10v.01M6 14v.01M18 14v.01M10 14h4M3 3l18 18" /></svg>;
const Memo = memo(IconKeyboardOff);
export default Memo;