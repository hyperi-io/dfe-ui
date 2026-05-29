import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFountain = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-fountain" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9 16v-5a2 2 0 1 0-4 0M15 16v-5a2 2 0 1 1 4 0" /><path d="M12 16V6a3 3 0 0 1 6 0M6 6a3 3 0 0 1 6 0M3 16h18v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" /></svg>;
const Memo = memo(IconFountain);
export default Memo;