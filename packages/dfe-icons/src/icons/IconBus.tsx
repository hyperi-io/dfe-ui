import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBus = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-bus" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M16 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0" /><path d="M4 17H2V6a1 1 0 0 1 1-1h14a5 7 0 0 1 5 7v5h-2m-4 0H8" /><path d="m16 5 1.5 7H22M2 10h15M7 5v5M12 5v5" /></svg>;
const Memo = memo(IconBus);
export default Memo;