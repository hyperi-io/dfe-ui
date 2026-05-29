import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandDrops = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-drops" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M17.637 7.416a7.91 7.91 0 0 1 1.76 8.666A8 8 0 0 1 12 21a8 8 0 0 1-7.396-4.918 7.91 7.91 0 0 1 1.759-8.666L12 2z" /><path d="M14.466 10.923a3.6 3.6 0 0 1 .77 3.877A3.5 3.5 0 0 1 12 17a3.5 3.5 0 0 1-3.236-2.2 3.6 3.6 0 0 1 .77-3.877L12 8.5z" /></svg>;
const Memo = memo(IconBrandDrops);
export default Memo;