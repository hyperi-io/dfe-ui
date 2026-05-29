import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGlassGin = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-glass-gin" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 21h8M12 15v6M5.5 5a6.5 2 0 1 0 13 0 6.5 2 0 1 0-13 0" /><path d="M5.75 4.5C5.138 5.25 5 6.5 5 8a7 7 0 0 0 14 0c0-1.5-.094-2.75-.75-3.5" /></svg>;
const Memo = memo(IconGlassGin);
export default Memo;