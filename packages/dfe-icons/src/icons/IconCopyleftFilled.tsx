import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCopyleftFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-copyleft" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 3.34a10 10 0 1 1-14.995 8.984L2 12l.005-.324A10 10 0 0 1 17 3.34m-2.117 5.889a4.016 4.016 0 0 0-5.543-.23 1 1 0 0 0 1.32 1.502 2.016 2.016 0 0 1 2.783.116 1.993 1.993 0 0 1 0 2.766 2.016 2.016 0 0 1-2.783.116A1 1 0 0 0 9.34 15a4.016 4.016 0 0 0 5.543-.23 3.993 3.993 0 0 0 0-5.542z" /></svg>;
const Memo = memo(IconCopyleftFilled);
export default Memo;