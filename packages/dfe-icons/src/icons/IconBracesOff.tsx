import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBracesOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-braces-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M5.176 5.177C5.063 5.428 5 5.707 5 6v3c0 1.657-.895 3-2 3 1.105 0 2 1.343 2 3v3a2 2 0 0 0 2 2M17 4a2 2 0 0 1 2 2v3c0 1.657.895 3 2 3-1.105 0-2 1.343-2 3m-.176 3.821A2 2 0 0 1 17 20M3 3l18 18" /></svg>;
const Memo = memo(IconBracesOff);
export default Memo;