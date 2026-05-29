import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSmartHomeOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-smart-home-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7.097 7.125 5.06 8.71a2.67 2.67 0 0 0-1.029 2.105v7.2a2 2 0 0 0 2 2h12c.559 0 1.064-.229 1.427-.598M20.03 16v-5.185c0-.823-.38-1.6-1.03-2.105l-5.333-4.148a2.666 2.666 0 0 0-3.274 0l-1.029.8" /><path d="M15.332 15.345c-2.213.976-5.335.86-7.332-.345M3 3l18 18" /></svg>;
const Memo = memo(IconSmartHomeOff);
export default Memo;