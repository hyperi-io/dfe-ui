import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMessageCircleOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-message-circle-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8.595 4.577c3.223-1.176 7.025-.61 9.65 1.63 2.982 2.543 3.601 6.523 1.636 9.66m-1.908 2.109C15.186 20.166 11.083 20.642 7.7 19L3 20l1.3-3.9C2.071 12.804 2.806 8.589 5.98 6.043M3 3l18 18" /></svg>;
const Memo = memo(IconMessageCircleOff);
export default Memo;