import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSmokingNo = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-smoking-no" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 13v4M16 5v.5a2 2 0 0 0 2 2 2 2 0 0 1 2 2v.5M3 3l18 18M17 13h3a1 1 0 0 1 1 1v2c0 .28-.115.533-.3.714M17 17H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h9" /></svg>;
const Memo = memo(IconSmokingNo);
export default Memo;