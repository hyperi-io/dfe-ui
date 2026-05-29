import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconKeyframeAlignHorizontal = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-keyframe-align-horizontal" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12.816 16.58c-.207.267-.504.42-.816.42s-.61-.153-.816-.42l-2.908-3.748a1.39 1.39 0 0 1 0-1.664l2.908-3.748c.207-.267.504-.42.816-.42s.61.153.816.42l2.908 3.748a1.39 1.39 0 0 1 0 1.664zM3 12h2M19 12h2" /></svg>;
const Memo = memo(IconKeyframeAlignHorizontal);
export default Memo;