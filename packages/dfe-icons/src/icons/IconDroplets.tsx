import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconDroplets = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-droplets" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4.072 20.3a3 3 0 0 0 3.856 0 3 3 0 0 0 .67-3.798l-2.095-3.227a.6.6 0 0 0-1.005 0L3.4 16.502a3 3 0 0 0 .671 3.798M16.072 20.3a3 3 0 0 0 3.856 0 3 3 0 0 0 .67-3.798l-2.095-3.227a.6.6 0 0 0-1.005 0L15.4 16.502a3 3 0 0 0 .671 3.798M10.072 10.3a3 3 0 0 0 3.856 0 3 3 0 0 0 .67-3.798l-2.095-3.227a.6.6 0 0 0-1.005 0L9.4 6.502a3 3 0 0 0 .671 3.798z" /></svg>;
const Memo = memo(IconDroplets);
export default Memo;