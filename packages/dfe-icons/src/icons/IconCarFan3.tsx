import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCarFan3 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-car-fan-3" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 12V3l4.912 1.914a1.7 1.7 0 0 1 .428 2.925zM14.044 14.624 12 12h4M12 12H3l1.914-4.912a1.7 1.7 0 0 1 2.925-.428zM12 12v9l-4.912-1.914a1.7 1.7 0 0 1-.428-2.925zM18 15.5a.5.5 0 0 1 .5-.5h1a1.5 1.5 0 0 1 0 3H19h.5a1.5 1.5 0 0 1 0 3h-1a.5.5 0 0 1-.5-.5" /></svg>;
const Memo = memo(IconCarFan3);
export default Memo;