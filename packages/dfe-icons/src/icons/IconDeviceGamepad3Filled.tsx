import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDeviceGamepad3Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-device-gamepad-3" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m12.707 14.293 3 3A1 1 0 0 1 16 18v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2a1 1 0 0 1 .293-.707l3-3a1 1 0 0 1 1.414 0M6 8a1 1 0 0 1 .707.293l3 3a1 1 0 0 1 0 1.414l-3 3A1 1 0 0 1 6 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm14 0a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2a1 1 0 0 1-.707-.293l-3-3a1 1 0 0 1 0-1.414l3-3A1 1 0 0 1 18 8zm-6-6a2 2 0 0 1 2 2v2a1 1 0 0 1-.293.707l-3 3a1 1 0 0 1-1.414 0l-3-3A1 1 0 0 1 8 6V4a2 2 0 0 1 2-2z" /></svg>;
const Memo = memo(IconDeviceGamepad3Filled);
export default Memo;