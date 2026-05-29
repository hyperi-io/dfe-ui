import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconZodiacLeo = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-zodiac-leo" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M13 17a4 4 0 1 0 8 0M3 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0M7 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0" /><path d="M7 7c0 3 2 5 2 9M15 7c0 4-2 6-2 10" /></svg>;
const Memo = memo(IconZodiacLeo);
export default Memo;