import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconIroningSteamOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-ironing-steam-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9 4h7.459a3 3 0 0 1 2.959 2.507l.577 3.464.81 4.865a1 1 0 0 1-.821 1.15M16 16H3a7 7 0 0 1 6.056-6.937M13 9h6.8M12 19v2M8 19l-1 2M16 19l1 2M3 3l18 18" /></svg>;
const Memo = memo(IconIroningSteamOff);
export default Memo;