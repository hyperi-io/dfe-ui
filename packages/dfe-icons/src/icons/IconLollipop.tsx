import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLollipop = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-lollipop" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 10a7 7 0 1 0 14 0 7 7 0 1 0-14 0" /><path d="M21 10a3.5 3.5 0 0 0-7 0M14 10a3.5 3.5 0 0 1-7 0M14 17a3.5 3.5 0 0 0 0-7M14 3a3.5 3.5 0 0 0 0 7M3 21l6-6" /></svg>;
const Memo = memo(IconLollipop);
export default Memo;