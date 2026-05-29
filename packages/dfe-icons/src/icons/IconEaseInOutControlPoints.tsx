import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconEaseInOutControlPoints = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-ease-in-out-control-points" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M17 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0M17 20h-2M7 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0M7 4h2M14 4h-2M12 20h-2M3 20c8 0 10-16 18-16" /></svg>;
const Memo = memo(IconEaseInOutControlPoints);
export default Memo;