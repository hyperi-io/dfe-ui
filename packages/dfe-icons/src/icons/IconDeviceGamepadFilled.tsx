import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDeviceGamepadFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-device-gamepad" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M20 5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM8 9l-.117.007A1 1 0 0 0 7 10v1H6a1 1 0 0 0-1 1l.007.117A1 1 0 0 0 6 13h1v1a1 1 0 0 0 1 1l.117-.007A1 1 0 0 0 9 14v-1h1a1 1 0 0 0 1-1l-.007-.117A1 1 0 0 0 10 11H9v-1a1 1 0 0 0-1-1m10 3a1 1 0 0 0-1 1v.01a1 1 0 0 0 2 0V13a1 1 0 0 0-1-1m-3-2a1 1 0 0 0-1 1v.01a1 1 0 0 0 2 0V11a1 1 0 0 0-1-1" /></svg>;
const Memo = memo(IconDeviceGamepadFilled);
export default Memo;