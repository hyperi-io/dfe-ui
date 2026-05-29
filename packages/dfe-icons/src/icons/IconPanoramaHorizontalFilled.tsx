import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPanoramaHorizontalFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-panorama-horizontal" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19.31 4.591A2 2 0 0 1 22 6.464v11c0 1.382-1.38 2.38-2.694 1.897-4.879-1.845-9.734-1.845-14.612 0C3.39 19.856 2 18.88 2 17.49V6.458a2 2 0 0 1 2.676-1.87l.025.012.448.162c4.572 1.623 9.123 1.622 13.703-.003z" /></svg>;
const Memo = memo(IconPanoramaHorizontalFilled);
export default Memo;