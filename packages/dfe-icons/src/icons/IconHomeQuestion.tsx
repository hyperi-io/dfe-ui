import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHomeQuestion = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-home-question" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M20.136 11.136 12 3l-9 9h2v7a2 2 0 0 0 2 2h7" /><path d="M9 21v-6a2 2 0 0 1 2-2h2c.467 0 .896.16 1.236.428M19 22v.01M19 19a2 2 0 0 0 .914-3.782 1.98 1.98 0 0 0-2.414.483" /></svg>;
const Memo = memo(IconHomeQuestion);
export default Memo;