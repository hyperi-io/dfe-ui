import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandTether = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-tether" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M14.08 20.188c-1.15 1.083-3.02 1.083-4.17 0L2.98 13.64c-.96-.906-1.27-2.624-.69-3.831l2.4-5.018C5.16 3.8 6.41 3 7.47 3h9.06c1.06 0 2.31.802 2.78 1.79l2.4 5.019c.58 1.207.26 2.925-.69 3.83-3.453 3.293-3.466 3.279-6.94 6.549M12 15V8M8 8h8" /></svg>;
const Memo = memo(IconBrandTether);
export default Memo;