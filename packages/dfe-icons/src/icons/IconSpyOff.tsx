import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSpyOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-spy-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 11h8m4 0h6M5 11V7c0-.571.16-1.105.437-1.56M8 4h8a3 3 0 0 1 3 3v4M4 17a3 3 0 1 0 6 0 3 3 0 1 0-6 0M14.88 14.877a3 3 0 1 0 4.239 4.247m.59-3.414a3 3 0 0 0-1.425-1.422M10 17h4M3 3l18 18" /></svg>;
const Memo = memo(IconSpyOff);
export default Memo;