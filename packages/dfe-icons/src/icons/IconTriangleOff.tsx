import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTriangleOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-triangle-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m7.825 7.83-5.568 9.295a1.914 1.914 0 0 0 1.636 2.871H20m1.998-1.99a1.9 1.9 0 0 0-.255-.88L13.637 3.59a1.914 1.914 0 0 0-3.274 0L9.335 5.308M3 3l18 18" /></svg>;
const Memo = memo(IconTriangleOff);
export default Memo;