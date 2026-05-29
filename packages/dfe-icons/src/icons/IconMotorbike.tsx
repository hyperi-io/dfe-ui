import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMotorbike = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-motorbike" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M2 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0M16 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0M7.5 14h5l4-4H6m1.5 4 4-4" /><path d="M13 6h2l1.5 3 2 4" /></svg>;
const Memo = memo(IconMotorbike);
export default Memo;