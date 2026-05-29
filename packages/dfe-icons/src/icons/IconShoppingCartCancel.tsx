import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconShoppingCartCancel = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-shopping-cart-cancel" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0" /><path d="M12 17H6V3H4" /><path d="m6 5 14 1-.857 5.998M15.5 13H6M16 19a3 3 0 1 0 6 0 3 3 0 1 0-6 0M17 21l4-4" /></svg>;
const Memo = memo(IconShoppingCartCancel);
export default Memo;