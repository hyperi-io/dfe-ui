import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconForklift = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-forklift" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M12 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M7 17h5" /><path d="M3 17v-6h13v6M5 11V7h4M9 11V5h4l3 6M22 15h-3V5M16 13h3" /></svg>;
const Memo = memo(IconForklift);
export default Memo;