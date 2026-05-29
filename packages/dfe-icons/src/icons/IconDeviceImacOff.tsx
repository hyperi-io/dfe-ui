import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDeviceImacOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-device-imac-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 3h13a1 1 0 0 1 1 1v12c0 .28-.115.532-.3.713M17 17H4a1 1 0 0 1-1-1V4c0-.276.112-.526.293-.707M3 13h10m4 0h4M8 21h8M10 17l-.5 4M14 17l.5 4M3 3l18 18" /></svg>;
const Memo = memo(IconDeviceImacOff);
export default Memo;