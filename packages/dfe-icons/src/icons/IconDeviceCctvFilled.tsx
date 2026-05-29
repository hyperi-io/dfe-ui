import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDeviceCctvFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-device-cctv" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M20 8v6a8 8 0 1 1-16 0V8zm-8 2a4 4 0 0 0-3.996 3.826L8 14a4 4 0 1 0 4-4m.01 3a1 1 0 0 1 .117 1.993L12 15a1 1 0 0 1-.117-1.993zM2 5V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2" /></svg>;
const Memo = memo(IconDeviceCctvFilled);
export default Memo;