import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMatrix = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-matrix" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 16h.013M12.01 16h.005M16.015 16h.005M16.015 12h.005M8.01 12h.005M12.01 12h.005M16.02 8h.005M8.015 8h.005M12.015 8h.005M7 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1M17 4h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-1" /></svg>;
const Memo = memo(IconMatrix);
export default Memo;