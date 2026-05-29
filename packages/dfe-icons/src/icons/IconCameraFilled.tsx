import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCameraFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-camera" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M15 3a2 2 0 0 1 1.995 1.85L17 5a1 1 0 0 0 .883.993L18 6h1a3 3 0 0 1 2.995 2.824L22 9v9a3 3 0 0 1-2.824 2.995L19 21H5a3 3 0 0 1-2.995-2.824L2 18V9a3 3 0 0 1 2.824-2.995L5 6h1a1 1 0 0 0 1-1 2 2 0 0 1 1.85-1.995L9 3zm-3 7a3 3 0 0 0-2.985 2.698l-.011.152L9 13l.004.15A3 3 0 1 0 12 10" /></svg>;
const Memo = memo(IconCameraFilled);
export default Memo;