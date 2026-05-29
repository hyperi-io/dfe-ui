import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDeviceTvOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-device-tv-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M11 7h8a2 2 0 0 1 2 2v8m-1.178 2.824c-.25.113-.529.176-.822.176H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2M16 3l-4 4-4-4M3 3l18 18" /></svg>;
const Memo = memo(IconDeviceTvOff);
export default Memo;