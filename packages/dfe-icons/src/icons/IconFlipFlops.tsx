import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFlipFlops = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-flip-flops" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M18 4c2.21 0 4 1.682 4 3.758q.002.117-.008.234l-.6 9.014c-.11 1.683-1.596 3-3.392 3s-3.28-1.311-3.392-3l-.6-9.014c-.138-2.071 1.538-3.855 3.743-3.985a4 4 0 0 1 .25-.007z" /><path d="M14.5 14Q16 9 18 9t3.5 5M18 16v1M6 4c2.21 0 4 1.682 4 3.758q.002.117-.008.234l-.6 9.014c-.11 1.683-1.596 3-3.392 3s-3.28-1.311-3.392-3l-.6-9.014C1.87 5.921 3.546 4.137 5.75 4.007 5.834 4.007 5.917 4 6 4" /><path d="M2.5 14Q4 9 6 9t3.5 5M6 16v1" /></svg>;
const Memo = memo(IconFlipFlops);
export default Memo;