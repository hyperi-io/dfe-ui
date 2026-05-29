import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFlareFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-flare" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M11.106 2.553a1 1 0 0 1 1.788 0l2.851 5.701 5.702 2.852a1 1 0 0 1 .11 1.725l-.11.063-5.702 2.851-2.85 5.702a1 1 0 0 1-1.726.11l-.063-.11-2.852-5.702-5.701-2.85a1 1 0 0 1-.11-1.726l.11-.063 5.701-2.852z" /></svg>;
const Memo = memo(IconFlareFilled);
export default Memo;