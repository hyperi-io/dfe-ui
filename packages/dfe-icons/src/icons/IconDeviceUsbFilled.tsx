import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDeviceUsbFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-device-usb" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M15 2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 1 1v8a6 6 0 1 1-12 0V8a1 1 0 0 1 1-1h1V3a1 1 0 0 1 1-1zm-1 2h-4v3h4z" /></svg>;
const Memo = memo(IconDeviceUsbFilled);
export default Memo;