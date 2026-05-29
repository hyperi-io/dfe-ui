import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconZoomCancelFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-zoom-cancel" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M14 3.072a8 8 0 0 1 2.32 11.834l5.387 5.387a1 1 0 0 1-1.414 1.414l-5.388-5.387A8 8 0 0 1 2 10l.005-.285A8 8 0 0 1 14 3.072m-5.293 4.22a1 1 0 0 0-1.414 1.415L8.585 10l-1.292 1.293a1 1 0 0 0 1.414 1.414L10 11.415l1.293 1.292a1 1 0 0 0 1.414-1.414L11.415 10l1.292-1.293a1 1 0 1 0-1.414-1.414L10 8.585z" /></svg>;
const Memo = memo(IconZoomCancelFilled);
export default Memo;