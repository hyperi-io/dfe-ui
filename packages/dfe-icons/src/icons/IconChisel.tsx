import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconChisel = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-chisel" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m14 14 1.5 1.5M18.347 15.575l2.08 2.079a1.96 1.96 0 0 1-2.773 2.772l-2.08-2.079a1.96 1.96 0 0 1 2.773-2.772M3 6l3-3 7.414 7.414A2 2 0 0 1 14 11.828V14h-2.172a2 2 0 0 1-1.414-.586z" /></svg>;
const Memo = memo(IconChisel);
export default Memo;