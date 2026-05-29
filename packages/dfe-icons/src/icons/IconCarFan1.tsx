import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCarFan1 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-car-fan-1" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 12V3l4.912 1.914a1.7 1.7 0 0 1 .428 2.925zM14.424 15.03 12 12h6M12 12H3l1.914-4.912a1.7 1.7 0 0 1 2.925-.428zM12 12v9l-4.912-1.914a1.7 1.7 0 0 1-.428-2.925zM18 17l2-2v6" /></svg>;
const Memo = memo(IconCarFan1);
export default Memo;