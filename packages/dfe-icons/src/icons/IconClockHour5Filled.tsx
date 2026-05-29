import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconClockHour5Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-clock-hour-5" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34M11 7v5.022l.003.054.02.135.005.025a1 1 0 0 0 .056.165l.04.082.04.065 2.004 3.007a1 1 0 1 0 1.664-1.11L13 11.697V7a1 1 0 0 0-.883-.993L12 6a1 1 0 0 0-1 1" /></svg>;
const Memo = memo(IconClockHour5Filled);
export default Memo;