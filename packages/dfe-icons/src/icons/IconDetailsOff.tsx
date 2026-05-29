import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDetailsOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-details-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M5 19h14M20.986 16.984a2 2 0 0 0-.146-.734L13.74 4a2 2 0 0 0-3.5 0l-.821 1.417M7.95 7.951 3.14 16.25A2 2 0 0 0 4.89 19M12 3v5m0 4v7M3 3l18 18" /></svg>;
const Memo = memo(IconDetailsOff);
export default Memo;