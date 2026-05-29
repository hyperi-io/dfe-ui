import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGrillFork = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-grill-fork" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m5 5 11.5 11.5M19.347 16.575l1.08 1.079a1.96 1.96 0 0 1-2.773 2.772l-1.08-1.079a1.96 1.96 0 0 1 2.773-2.772M3 7l3.05 3.15a2.9 2.9 0 0 0 4.1-4.1L7 3" /></svg>;
const Memo = memo(IconGrillFork);
export default Memo;