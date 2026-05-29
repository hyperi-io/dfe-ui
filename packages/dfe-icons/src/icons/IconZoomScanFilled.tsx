import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconZoomScanFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-zoom-scan" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M4 15a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 1 0 2H6a3 3 0 0 1-3-3v-2a1 1 0 0 1 1-1M20 15a1 1 0 0 1 1 1v2a3 3 0 0 1-3 3h-2a1 1 0 0 1 0-2h2a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1M11 7a4 4 0 0 1 3.446 6.031l2.261 2.262a1 1 0 0 1-1.414 1.414l-2.262-2.26-.031.017A4 4 0 0 1 7 11l.005-.2A4 4 0 0 1 11 7M8 3a1 1 0 1 1 0 2H6a1 1 0 0 0-1 1v2a1 1 0 1 1-2 0V6a3 3 0 0 1 3-3zM18 3a3 3 0 0 1 3 3v2a1 1 0 0 1-2 0V6a1 1 0 0 0-1-1h-2a1 1 0 0 1 0-2z" /></svg>;
const Memo = memo(IconZoomScanFilled);
export default Memo;