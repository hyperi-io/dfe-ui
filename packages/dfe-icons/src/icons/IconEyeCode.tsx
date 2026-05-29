import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconEyeCode = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-eye-code" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0" /><path d="M11.11 17.958Q6.298 17.498 3 12q3.6-6 9-6t9 6q-.316.528-.647 1.008M20 21l2-2-2-2M17 17l-2 2 2 2" /></svg>;
const Memo = memo(IconEyeCode);
export default Memo;