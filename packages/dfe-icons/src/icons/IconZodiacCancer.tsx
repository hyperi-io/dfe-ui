import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconZodiacCancer = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-zodiac-cancer" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M15 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0" /><path d="M3 12a10 6.5 0 0 1 14-6.5M21 12a10 6.5 0 0 1-14 6.5" /></svg>;
const Memo = memo(IconZodiacCancer);
export default Memo;