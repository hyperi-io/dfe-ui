import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandDeliveroo = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-deliveroo" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m15 11 1-9 5 .5L20 16l-3 6-12.5-2.5-1.5-6 7-1.5-1.5-7.5 4.5-1z" /><path fill="currentColor" d="M14.5 15.5a1 1 0 1 0 2 0 1 1 0 1 0-2 0M10.5 14.5a1 1 0 1 0 2 0 1 1 0 1 0-2 0" /></svg>;
const Memo = memo(IconBrandDeliveroo);
export default Memo;