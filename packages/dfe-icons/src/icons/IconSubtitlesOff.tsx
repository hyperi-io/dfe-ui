import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSubtitlesOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-subtitles-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9 5h9a3 3 0 0 1 3 3v8a3 3 0 0 1-.13.874m-2.006 2A3 3 0 0 1 18 19H6a3 3 0 0 1-3-3V8c0-1.35.893-2.493 2.12-2.869M7 15h5M17 12h-1M12 12h-2M3 3l18 18" /></svg>;
const Memo = memo(IconSubtitlesOff);
export default Memo;