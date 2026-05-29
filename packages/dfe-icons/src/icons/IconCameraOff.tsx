import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCameraOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-camera-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8.297 4.289A1 1 0 0 1 9 4h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v8m-1.187 2.828c-.249.11-.524.172-.813.172H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1c.298 0 .58-.065.834-.181" /><path d="M10.422 10.448a3 3 0 1 0 4.15 4.098M3 3l18 18" /></svg>;
const Memo = memo(IconCameraOff);
export default Memo;