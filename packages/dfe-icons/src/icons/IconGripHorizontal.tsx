import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGripHorizontal = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-grip-horizontal" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 9a1 1 0 1 0 2 0 1 1 0 1 0-2 0M4 15a1 1 0 1 0 2 0 1 1 0 1 0-2 0M11 9a1 1 0 1 0 2 0 1 1 0 1 0-2 0M11 15a1 1 0 1 0 2 0 1 1 0 1 0-2 0M18 9a1 1 0 1 0 2 0 1 1 0 1 0-2 0M18 15a1 1 0 1 0 2 0 1 1 0 1 0-2 0" /></svg>;
const Memo = memo(IconGripHorizontal);
export default Memo;