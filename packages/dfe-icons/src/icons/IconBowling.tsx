import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBowling = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-bowling" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 11v.01M11 10v.01M10 14v.01M11.059 6.07a8 8 0 1 0 .32 15.81M15.969 9h4M14.969 5c0 1.5 1 2 1 4 0 2.5-2 4.5-2 7 0 2.6 1.9 6 1.9 6h4.1s2-3.4 2-6c0-2.5-2-4.5-2-7 0-2 1-2.5 1-4a3 3 0 1 0-6 0" /></svg>;
const Memo = memo(IconBowling);
export default Memo;