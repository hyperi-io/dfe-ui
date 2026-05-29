import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconRibbonHealth = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-ribbon-health" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 21s9.286-9.841 9.286-13.841a3.86 3.86 0 0 0-1.182-3.008A4.13 4.13 0 0 0 12 3.007 4.13 4.13 0 0 0 8.896 4.15a3.86 3.86 0 0 0-1.182 3.01C7.714 11.16 17 21 17 21" /></svg>;
const Memo = memo(IconRibbonHealth);
export default Memo;