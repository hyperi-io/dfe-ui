import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAwardOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-award-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M16.72 12.704a6 6 0 0 0-8.433-8.418m-1.755 2.24a6 6 0 0 0 7.936 7.944" /><path d="m12 15 3.4 5.89 1.598-3.233.707.046m1.108-2.902-1.617-2.8M6.802 12l-3.4 5.89L7 17.657l1.598 3.232 3.4-5.889M3 3l18 18" /></svg>;
const Memo = memo(IconAwardOff);
export default Memo;