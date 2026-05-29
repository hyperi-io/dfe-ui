import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCurrencyIranianRial = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-currency-iranian-rial" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9 4v9a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3v-1M12 5v8a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-1M21 14v1.096a5 5 0 0 1-3.787 4.85L17 20M11 18h.01M14 18h.01" /></svg>;
const Memo = memo(IconCurrencyIranianRial);
export default Memo;