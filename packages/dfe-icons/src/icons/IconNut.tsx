import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconNut = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-nut" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M19 6.84a2.01 2.01 0 0 1 1 1.754v6.555c0 .728-.394 1.4-1.03 1.753l-6 3.844a2 2 0 0 1-1.94 0l-6-3.844A2 2 0 0 1 4 15.15V8.593c0-.728.394-1.399 1.03-1.753l6-3.582a2.05 2.05 0 0 1 2 0l6 3.582z" /><path d="M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0" /></svg>;
const Memo = memo(IconNut);
export default Memo;