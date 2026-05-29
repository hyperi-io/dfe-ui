import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBalloonFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-balloon" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 1a7 7 0 0 1 7 7c0 5.457-3.028 10-7 10-3.9 0-6.89-4.379-6.997-9.703L5 8l.004-.24A7 7 0 0 1 12 1m0 4a1 1 0 0 0 0 2l.117.007A1 1 0 0 1 13 8l.007.117A1 1 0 0 0 15 8a3 3 0 0 0-3-3" /><path d="M12 16a1 1 0 0 1 .993.883L13 17v1a3 3 0 0 1-2.824 2.995L10 21H7a1 1 0 0 0-.993.883L6 22a1 1 0 0 1-2 0 3 3 0 0 1 2.824-2.995L7 19h3a1 1 0 0 0 .993-.883L11 18v-1a1 1 0 0 1 1-1" /></svg>;
const Memo = memo(IconBalloonFilled);
export default Memo;