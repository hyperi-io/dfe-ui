import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconVideoMinusFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-video-minus" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M13 5a3 3 0 0 1 3 3v.381l3.106-1.552A2 2 0 0 1 22 8.618v6.765a2 2 0 0 1-2.894 1.787L16 15.618V16a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zm-2 6H7a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2" /></svg>;
const Memo = memo(IconVideoMinusFilled);
export default Memo;