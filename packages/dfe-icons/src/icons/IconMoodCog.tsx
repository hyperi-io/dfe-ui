import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMoodCog = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-mood-cog" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M21 12a9 9 0 1 0-8.983 9M16.001 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0M18.001 14.5V16M18.001 20v1.5M21.032 16.25l-1.299.75M16.27 19l-1.3.75M14.97 16.25l1.3.75M19.733 19l1.3.75M9 10h.01M15 10h.01" /><path d="M9.5 15c.658.64 1.56 1 2.5 1" /></svg>;
const Memo = memo(IconMoodCog);
export default Memo;