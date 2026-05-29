import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMoodTongueWink = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-mood-tongue-wink" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0M9 10h.01" /><path d="M10 14v2a2 2 0 0 0 4 0v-2M15.5 14h-7M17 10c-.5-1-2.5-1-3 0" /></svg>;
const Memo = memo(IconMoodTongueWink);
export default Memo;