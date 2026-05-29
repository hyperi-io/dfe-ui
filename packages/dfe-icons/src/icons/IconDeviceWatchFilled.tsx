import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDeviceWatchFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-device-watch" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M15 2a1 1 0 0 1 1 1v2.126c1.726.445 3 2.01 3 3.874v6a4 4 0 0 1-3 3.874V21a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.126A4 4 0 0 1 5 15V9a4 4 0 0 1 3-3.874V3a1 1 0 0 1 1-1zm-1 17h-4v1h4zm0-15h-4v1h4z" /></svg>;
const Memo = memo(IconDeviceWatchFilled);
export default Memo;