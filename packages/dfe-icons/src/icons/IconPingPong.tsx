import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPingPong = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-ping-pong" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12.718 20.713a7.64 7.64 0 0 1-7.48-12.755l.72-.72a7.64 7.64 0 0 1 9.105-1.283L17.45 3.61a2.08 2.08 0 0 1 3.057 2.815l-.116.126-2.346 2.387a7.64 7.64 0 0 1-1.052 8.864" /><path d="M11 18a3 3 0 1 0 6 0 3 3 0 1 0-6 0M9.3 5.3l9.4 9.4" /></svg>;
const Memo = memo(IconPingPong);
export default Memo;