import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMagnetic = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-magnetic" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 3v18M18 7c-.633-1.255-1.538-2-2.5-2-1.933 0-3.5 3.134-3.5 7s1.567 7 3.5 7 3.5-3.134 3.5-7v-1M6 7c.633-1.255 1.538-2 2.5-2 1.933 0 3.5 3.134 3.5 7s-1.567 7-3.5 7S5 15.866 5 12v-1" /><path d="m3 13 2-2 2 2M17 13l2-2 2 2" /></svg>;
const Memo = memo(IconMagnetic);
export default Memo;