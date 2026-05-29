import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandTripadvisor = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-tripadvisor" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M5 13.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0M16 13.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0" /><path d="M17.5 9a4.5 4.5 0 1 0 3.5 1.671L22 9zM6.5 9A4.5 4.5 0 1 1 3 10.671L2 9z" /><path d="m10.5 15.5 1.5 2 1.5-2M9 6.75q3-1 6 0" /></svg>;
const Memo = memo(IconBrandTripadvisor);
export default Memo;