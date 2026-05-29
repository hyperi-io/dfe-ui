import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMoodNerd = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-mood-nerd" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" /><path d="M6 10a2 2 0 1 0 4 0 2 2 0 1 0-4 0M14 10a2 2 0 1 0 4 0 2 2 0 1 0-4 0M9.5 15a3.5 3.5 0 0 0 5 0M3.5 9H6M18 9h2.5M10 9.5q2-2 4 0" /></svg>;
const Memo = memo(IconMoodNerd);
export default Memo;