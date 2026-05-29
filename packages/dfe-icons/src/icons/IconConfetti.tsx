import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconConfetti = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-confetti" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 5h2M5 4v2M11.5 4 11 6M18 5h2M19 4v2M15 9l-1 1M18 13l2-.5M18 19h2M19 18v2M14 16.518 7.482 10l-4.39 9.58a1 1 0 0 0 1.329 1.329z" /></svg>;
const Memo = memo(IconConfetti);
export default Memo;