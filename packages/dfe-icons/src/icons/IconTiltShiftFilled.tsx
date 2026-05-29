import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTiltShiftFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-tilt-shift" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M8.178 2.766a1 1 0 1 1 .764 1.848 8 8 0 0 0-2.595 1.733 1 1 0 1 1-1.414-1.414 10 10 0 0 1 3.245-2.167M2.767 8.176a1 1 0 1 1 1.846.768A8 8 0 0 0 4 12.002a1 1 0 0 1-2-.004 10 10 0 0 1 .767-3.822M3.308 14.516a1 1 0 0 1 1.306.542 8 8 0 0 0 1.733 2.595 1 1 0 1 1-1.414 1.414 10 10 0 0 1-2.167-3.245 1 1 0 0 1 .542-1.306M7.637 19.926a1 1 0 0 1 1.307-.54 8 8 0 0 0 3.058.614 1 1 0 0 1-.004 2 10 10 0 0 1-3.822-.767 1 1 0 0 1-.54-1.307M17.653 17.653a1 1 0 1 1 1.414 1.414 10 10 0 0 1-3.245 2.167 1 1 0 1 1-.764-1.848 8 8 0 0 0 2.595-1.733M21.002 11A1 1 0 0 1 22 12.002a10 10 0 0 1-.767 3.822 1 1 0 1 1-1.846-.768A8 8 0 0 0 20 11.998 1 1 0 0 1 21.002 11M17.653 4.933a1 1 0 0 1 1.414 0 10 10 0 0 1 2.167 3.245 1 1 0 1 1-1.848.764 8 8 0 0 0-1.733-2.595 1 1 0 0 1 0-1.414M12.002 2a10 10 0 0 1 3.822.767 1 1 0 1 1-.768 1.846A8 8 0 0 0 11.998 4a1 1 0 0 1 .004-2M12 9a3 3 0 1 1-3 3l.005-.176A3 3 0 0 1 12 9" /></svg>;
const Memo = memo(IconTiltShiftFilled);
export default Memo;