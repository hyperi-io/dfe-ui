import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWindsockFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-windsock" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M6 2a1 1 0 0 1 1 1v1.079l11.083.924A1 1 0 0 1 19 6v4a1 1 0 0 1-.917.997L7 11.92V20h1a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2h1V3a1 1 0 0 1 1-1m1 4.086v3.827l3-.25V6.336zm7 .584v2.659l3-.25V6.92z" /></svg>;
const Memo = memo(IconWindsockFilled);
export default Memo;