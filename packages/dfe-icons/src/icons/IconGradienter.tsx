import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGradienter = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-gradienter" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3.227 14c.917 4 4.497 7 8.773 7 4.277 0 7.858-3 8.773-7M20.78 10A9 9 0 0 0 12 3a8.985 8.985 0 0 0-8.782 7" /><path d="M10 12a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /></svg>;
const Memo = memo(IconGradienter);
export default Memo;