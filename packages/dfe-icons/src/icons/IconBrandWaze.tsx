import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandWaze = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-waze" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M6.66 17.52A7 7 0 0 1 3 13c2 0 3-1 3-2.51C6 6.57 8.25 3 13.38 3 18 3 21 6.51 21 11a8.08 8.08 0 0 1-3.39 6.62M10 18.69a17.3 17.3 0 0 0 3.33.3h.54" /><path d="M14 19a2 2 0 1 0 4 0 2 2 0 1 0-4 0M6 19a2 2 0 1 0 4 0 2 2 0 1 0-4 0M16 9h.01M11 9h.01" /></svg>;
const Memo = memo(IconBrandWaze);
export default Memo;