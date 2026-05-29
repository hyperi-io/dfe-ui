import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandBinance = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-binance" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m6 8 2 2 4-4 4 4 2-2-6-6zM6 16l2-2 4 4 3.5-3.5 2 2L12 22zM20 10l2 2-2 2-2-2zM4 10l2 2-2 2-2-2zM12 10l2 2-2 2-2-2z" /></svg>;
const Memo = memo(IconBrandBinance);
export default Memo;