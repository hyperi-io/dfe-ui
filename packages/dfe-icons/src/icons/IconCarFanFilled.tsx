import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCarFanFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-car-fan" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m12.363 2.068 4.912 1.914a2.7 2.7 0 0 1 .68 4.646l-3.045 2.371L21 11a1 1 0 0 1 .932 1.363l-1.914 4.912a2.7 2.7 0 0 1-4.646.68L13 14.908V21a1 1 0 0 1-1.363.932l-4.912-1.914a2.7 2.7 0 0 1-.68-4.646L9.09 13H3a1 1 0 0 1-.932-1.363l1.914-4.912a2.7 2.7 0 0 1 4.646-.68l2.371 3.044L11 3a1 1 0 0 1 1.363-.932" /></svg>;
const Memo = memo(IconCarFanFilled);
export default Memo;