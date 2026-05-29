import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPlayCard4Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-play-card-4" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm.01 16H17a1 1 0 0 0-.117 1.993l.127.007a1 1 0 0 0 0-2M14 8a1 1 0 0 0-1 1v2h-2V9a1 1 0 0 0-2 0v2a2 2 0 0 0 2 2h2v2a1 1 0 0 0 .883.993L14 16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1M7.01 4H7a1 1 0 0 0-.117 1.993L7.01 6a1 1 0 1 0 0-2" /></svg>;
const Memo = memo(IconPlayCard4Filled);
export default Memo;