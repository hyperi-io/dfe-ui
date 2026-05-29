import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCurrencyEuroOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-currency-euro-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M17.2 7c-1.977-2.26-4.954-2.602-7.234-1.04M8.053 8.039c-1.604 2.72-1.374 6.469.69 8.894 2.292 2.691 6 2.758 8.356.18M10 10H5m0 4h8M3 3l18 18" /></svg>;
const Memo = memo(IconCurrencyEuroOff);
export default Memo;