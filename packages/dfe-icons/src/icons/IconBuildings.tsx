import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBuildings = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-buildings" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 21V6c0-1 1-2 2-2h5c1 0 2 1 2 2v15M16 8h2c1 0 2 1 2 2v11M3 21h18M10 12v.01M10 16v.01M10 8v.01M7 12v.01M7 16v.01M7 8v.01M17 12v.01M17 16v.01" /></svg>;
const Memo = memo(IconBuildings);
export default Memo;