import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconEggOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-egg-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M17.927 17.934C16.716 19.792 14.576 20.887 12 21c-4.2 0-7-2.763-7-6.917 0-2.568.753-5.14 1.91-7.158M8.642 4.628C9.676 3.608 10.838 2.998 12 3c3.5.007 7 5.545 7 11.083q0 .447-.045.868M3 3l18 18" /></svg>;
const Memo = memo(IconEggOff);
export default Memo;