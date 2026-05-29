import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCarCrash = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-car-crash" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /><path d="m7 6 4 5h1a2 2 0 0 1 2 2v4h-2m-4 0H3m0-6h8m-6 0V6m2 0H3M14 8V6M19 12h2M17.5 15.5 19 17M17.5 8.5 19 7" /></svg>;
const Memo = memo(IconCarCrash);
export default Memo;