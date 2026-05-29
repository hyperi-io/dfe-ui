import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBatteryAutomotiveFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-battery-automotive" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M18 2a1 1 0 0 1 1 1v1a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3V3a1 1 0 1 1 2 0v1h10V3a1 1 0 0 1 1-1m-2 7.5a1 1 0 0 0-1 1v.5h-.5a1 1 0 0 0 0 2h.5v.5a1 1 0 0 0 2 0V13h.5a1 1 0 0 0 0-2H17v-.5a1 1 0 0 0-1-1M9.5 11h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2" /></svg>;
const Memo = memo(IconBatteryAutomotiveFilled);
export default Memo;