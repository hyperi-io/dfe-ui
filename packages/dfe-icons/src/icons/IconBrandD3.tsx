import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandD3 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-d3" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 4h1.8C8.776 4 12 7.582 12 12s-3.224 8-7.2 8H3M12 4h5.472C19.42 4 21 5.79 21 8s-1.58 4-3.528 4M17.472 12H15M17.472 12H15.12M17.472 12C19.42 12 21 13.79 21 16s-1.58 4-3.528 4H12" /></svg>;
const Memo = memo(IconBrandD3);
export default Memo;