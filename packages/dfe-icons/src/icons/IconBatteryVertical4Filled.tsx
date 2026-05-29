import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBatteryVertical4Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-battery-vertical-4" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M13.5 3a1.5 1.5 0 0 1 1.395.948l.018.052H15a3 3 0 0 1 2.995 2.824L18 7v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h.086l.019-.052a1.5 1.5 0 0 1 1.25-.941L10.5 3zm.5 13h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2m0-3h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2m0-3h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2m0-3h-4a1 1 0 1 0 0 2h4a1 1 0 0 0 0-2" /></svg>;
const Memo = memo(IconBatteryVertical4Filled);
export default Memo;