import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMath1Divide3 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-math-1-divide-3" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 15.5a.5.5 0 0 1 .5-.5h2a1.5 1.5 0 0 1 0 3h-1.167H12.5a1.5 1.5 0 0 1 0 3h-2a.5.5 0 0 1-.5-.5M5 12h14M10 5l2-2v6" /></svg>;
const Memo = memo(IconMath1Divide3);
export default Memo;