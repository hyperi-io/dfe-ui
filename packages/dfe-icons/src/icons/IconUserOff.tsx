import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconUserOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-user-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8.18 8.189a4.01 4.01 0 0 0 2.616 2.627m3.507-.545a4 4 0 1 0-5.59-5.552M6 21v-2a4 4 0 0 1 4-4h4c.412 0 .81.062 1.183.178m2.633 2.618c.12.38.184.785.184 1.204v2M3 3l18 18" /></svg>;
const Memo = memo(IconUserOff);
export default Memo;