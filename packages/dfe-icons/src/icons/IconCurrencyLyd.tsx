import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCurrencyLyd = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-currency-lyd" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M11 15h.01M21 5v10a2 2 0 0 1-2 2h-2.764a2 2 0 0 1-1.789-1.106L14 15M5 8l2.773 4.687c.427.697.234 1.626-.43 2.075A1.4 1.4 0 0 1 6.57 15H4.346a.93.93 0 0 1-.673-.293L3 14" /></svg>;
const Memo = memo(IconCurrencyLyd);
export default Memo;