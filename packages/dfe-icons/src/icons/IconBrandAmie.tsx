import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandAmie = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-amie" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 8.5c0 1.33.472 2.55 1.257 3.5A5.5 5.5 0 0 0 12 19.743 5.5 5.5 0 0 0 19.743 12 5.5 5.5 0 0 0 12 4.257 5.5 5.5 0 0 0 3 8.5" /><path d="M10 9.5c0-.828.895-1.5 2-1.5s2 .672 2 1.5v5c0 .828-.895 1.5-2 1.5s-2-.672-2-1.5z" /></svg>;
const Memo = memo(IconBrandAmie);
export default Memo;