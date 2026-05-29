import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconClockHour7Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-clock-hour-7" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34m-4.007 8.777L13 12V7a1 1 0 0 0-2 0v4.696l-1.832 2.75a1 1 0 0 0 .184 1.316l.093.07a1 1 0 0 0 1.387-.277l2.024-3.038.06-.116.032-.081.03-.109z" /></svg>;
const Memo = memo(IconClockHour7Filled);
export default Memo;