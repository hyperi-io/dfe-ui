import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTeapot = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-teapot" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10.29 3h3.42a2 2 0 0 1 1.988 1.78l1.555 14A2 2 0 0 1 15.265 21h-6.53a2 2 0 0 1-1.988-2.22l1.555-14A2 2 0 0 1 10.29 3" /><path d="M7.47 12.5 3.213 7.481A.899.899 0 0 1 3.903 6h13.09A3 3 0 0 1 20 9v3c0 1.657-1.346 3-3.007 3M7 17h10" /></svg>;
const Memo = memo(IconTeapot);
export default Memo;