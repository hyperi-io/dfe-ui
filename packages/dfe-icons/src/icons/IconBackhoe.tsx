import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBackhoe = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-backhoe" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M2 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M11 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M13 19H4M4 15h9" /><path d="M8 12V7h2a3 3 0 0 1 3 3v5" /><path d="M5 15v-2a1 1 0 0 1 1-1h7M21.12 9.88 18 5l-5 5M21.12 9.88A3 3 0 0 1 19 15a3 3 0 0 1-2.12-.88z" /></svg>;
const Memo = memo(IconBackhoe);
export default Memo;