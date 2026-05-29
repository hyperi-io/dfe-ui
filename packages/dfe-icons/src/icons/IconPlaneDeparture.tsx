import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPlaneDeparture = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-plane-departure" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m14.639 10.258 4.83-1.294a2 2 0 1 1 1.035 3.863L6.015 16.71l-4.45-5.02 2.897-.776 2.45 1.414 2.897-.776-3.743-6.244 2.898-.777zM3 21h18" /></svg>;
const Memo = memo(IconPlaneDeparture);
export default Memo;