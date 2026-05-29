import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconRewindForward15 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-rewind-forward-15" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m17 9 3-3-3-3" /><path d="M9 18A6 6 0 1 1 9 6h11M16 20h2a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-2v-3h3M13 14v6" /></svg>;
const Memo = memo(IconRewindForward15);
export default Memo;