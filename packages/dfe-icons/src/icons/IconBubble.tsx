import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBubble = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-bubble" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12.4 3a5.34 5.34 0 0 1 4.906 3.239 5.333 5.333 0 0 1-1.195 10.6 4.26 4.26 0 0 1-5.28 1.863L7 21v-3.134a2.668 2.668 0 0 1-1.795-3.773A4.8 4.8 0 0 1 8.113 5.16 5.33 5.33 0 0 1 12.4 3" /></svg>;
const Memo = memo(IconBubble);
export default Memo;