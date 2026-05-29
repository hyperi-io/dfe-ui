import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMicrophoneOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-microphone-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m3 3 18 18M9 5a3 3 0 0 1 6 0v5a3 3 0 0 1-.13.874m-2 2A3 3 0 0 1 9 10.002v-1" /><path d="M5 10a7 7 0 0 0 10.846 5.85m2-2A6.97 6.97 0 0 0 18.998 10M8 21h8M12 17v4" /></svg>;
const Memo = memo(IconMicrophoneOff);
export default Memo;