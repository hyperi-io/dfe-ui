import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWhisk = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-whisk" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M21.015 3.035 4.5 19.5M3.173 17.619a4.63 4.63 0 0 0 3.284 3.26 4.67 4.67 0 0 0 4.487-1.194c1.85-1.836 4.07-10.65 4.07-10.65s-8.88 2.296-10.639 4.132a4.59 4.59 0 0 0-1.202 4.452" /></svg>;
const Memo = memo(IconWhisk);
export default Memo;