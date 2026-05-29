import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFileTextShield = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-file-text-shield" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M13 3v4a.997.997 0 0 0 1 1h4" /><path d="M11 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v3.5M8 9h1M8 12.994h3M8 16.997h2" /><path d="M21 15.994c0 4-2.5 6-3.5 6s-3.5-2-3.5-6c1 0 2.5-.5 3.5-1.5 1 1 2.5 1.5 3.5 1.5" /></svg>;
const Memo = memo(IconFileTextShield);
export default Memo;