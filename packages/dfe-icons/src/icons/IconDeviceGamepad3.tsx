import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDeviceGamepad3 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-device-gamepad-3" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9 12 6 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2zM15 12l3-3h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2zM12 15l-3 3v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2zM12 9 9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2z" /></svg>;
const Memo = memo(IconDeviceGamepad3);
export default Memo;