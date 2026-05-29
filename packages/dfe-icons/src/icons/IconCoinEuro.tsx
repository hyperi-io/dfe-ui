import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCoinEuro = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-coin-euro" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" /><path d="M14.401 8c-.669-.628-1.5-1-2.401-1-2.21 0-4 2.239-4 5s1.79 5 4 5c.9 0 1.731-.372 2.4-1M7 10.5h4M7 13.5h4" /></svg>;
const Memo = memo(IconCoinEuro);
export default Memo;