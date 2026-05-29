import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBatteryVerticalCharging2 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-battery-vertical-charging-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 18V7a2 2 0 0 1 2-2h.5c.276 0 .5-.224.5-.5s.224-.5.5-.5h3c.276 0 .5.224.5.5s.224.5.5.5h.5a2 2 0 0 1 2 2v1M7 18a2 2 0 0 0 2 2h1M12 14h6v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zM15 21v-3M13 14v-2.5M17 14v-2.5" /></svg>;
const Memo = memo(IconBatteryVerticalCharging2);
export default Memo;