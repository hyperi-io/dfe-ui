import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLibraryMinus = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-library-minus" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 5.667A2.667 2.667 0 0 1 9.667 3h8.666A2.667 2.667 0 0 1 21 5.667v8.666A2.667 2.667 0 0 1 18.333 17H9.667A2.667 2.667 0 0 1 7 14.333z" /><path d="M4.012 7.26A2 2 0 0 0 3 8.997v10c0 1.1.9 2 2 2h10c.75 0 1.158-.385 1.5-1M11 10h6" /></svg>;
const Memo = memo(IconLibraryMinus);
export default Memo;