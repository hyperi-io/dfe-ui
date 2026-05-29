import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMarkdownOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-markdown-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M9 5h10a2 2 0 0 1 2 2v10M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 1.85-2" /><path d="M7 15V9l2 2 1-1m1 1v4M17.5 13.5l.5-.5m-2-1V9M3 3l18 18" /></svg>;
const Memo = memo(IconMarkdownOff);
export default Memo;