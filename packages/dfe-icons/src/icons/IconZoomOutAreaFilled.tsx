import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconZoomOutAreaFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-zoom-out-area" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M15 9a6 6 0 0 1 4.891 9.476l2.816 2.817a1 1 0 0 1-1.414 1.414l-2.817-2.816A6 6 0 0 1 9 15l.004-.225A6 6 0 0 1 15 9m2 5h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2M3 14a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 1 0 2H5a3 3 0 0 1-3-3v-1a1 1 0 0 1 1-1m0-5a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1m3-7a1 1 0 1 1 0 2H5a1 1 0 0 0-1 1v1a1 1 0 1 1-2 0V5a3 3 0 0 1 3-3zm5 0a1 1 0 0 1 0 2h-1a1 1 0 1 1 0-2zm5 0a3 3 0 0 1 3 3v1a1 1 0 0 1-2 0V5a1 1 0 0 0-1-1h-1a1 1 0 0 1 0-2z" /></svg>;
const Memo = memo(IconZoomOutAreaFilled);
export default Memo;