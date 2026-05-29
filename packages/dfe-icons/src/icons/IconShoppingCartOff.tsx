import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconShoppingCartOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-shopping-cart-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 19a2 2 0 1 0 4 0 2 2 0 1 0-4 0M17 17a2 2 0 1 0 2 2" /><path d="M17 17H6V6M9.239 5.231 20 6l-1 7h-2m-4 0H6M3 3l18 18" /></svg>;
const Memo = memo(IconShoppingCartOff);
export default Memo;