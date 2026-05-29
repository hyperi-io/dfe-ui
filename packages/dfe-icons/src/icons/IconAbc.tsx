import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAbc = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-abc" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 16v-6a2 2 0 1 1 4 0v6M3 13h4M10 8v6a2 2 0 1 0 4 0v-1a2 2 0 1 0-4 0v1M20.732 12A2 2 0 0 0 17 13v1a2 2 0 0 0 3.726 1.01" /></svg>;
const Memo = memo(IconAbc);
export default Memo;