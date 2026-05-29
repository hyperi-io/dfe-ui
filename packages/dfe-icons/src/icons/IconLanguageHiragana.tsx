import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLanguageHiragana = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-language-hiragana" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 5h7M7 4c0 4.846 0 7 .5 8" /><path d="M10 8.5c0 2.286-2 4.5-3.5 4.5S4 11.865 4 11q0-3 3-3c3 0 5 .57 5 2.857q0 2.286-2 3.143M12 20l4-9 4 9M19.1 18h-6.2" /></svg>;
const Memo = memo(IconLanguageHiragana);
export default Memo;