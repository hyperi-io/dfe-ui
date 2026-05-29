import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconExposureOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-exposure-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m3.6 20.4 8.371-8.371m2.04-2.04L20.4 3.6M6 8h2m0 0v2M14 16h2M7 3h12a2 2 0 0 1 2 2v12m-.5 3.5c-.362.36-.95.5-1.5.5H5a2 2 0 0 1-2-2V5c0-.541.215-1.033.565-1.393M3 3l18 18" /></svg>;
const Memo = memo(IconExposureOff);
export default Memo;