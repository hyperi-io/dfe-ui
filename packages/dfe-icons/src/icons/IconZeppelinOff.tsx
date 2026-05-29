import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconZeppelinOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-zeppelin-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M15.773 15.783c-.723.141-1.486.217-2.273.217q-3.194 0-7.364-2.777L4 15v-3.33A46 46 0 0 1 2 10a46 46 0 0 1 2-1.67V5l2.135 1.778q.196-.13.39-.256m2.564-1.42Q11.49 4 13.5 4c4.694 0 8.5 2.686 8.5 6 0 1.919-1.276 3.627-3.261 4.725" /><path d="M10 15.5V20h6v-4M3 3l18 18" /></svg>;
const Memo = memo(IconZeppelinOff);
export default Memo;