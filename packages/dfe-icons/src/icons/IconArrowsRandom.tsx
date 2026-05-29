import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArrowsRandom = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-arrows-random" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M20 21h-4v-4M16 21l5-5M6.5 9.504l-3.5-2L5 4M3 7.504l6.83-1.87M4 16l4-1 1 4M8 15l-3.5 6M21 5l-.5 4-4-.5M20.5 9 16 3.5" /></svg>;
const Memo = memo(IconArrowsRandom);
export default Memo;