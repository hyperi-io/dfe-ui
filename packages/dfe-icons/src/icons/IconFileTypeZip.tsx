import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFileTypeZip = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-file-type-zip" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4M16 18h1.5a1.5 1.5 0 0 0 0-3H16v6M12 15v6M5 15h3l-3 6h3" /></svg>;
const Memo = memo(IconFileTypeZip);
export default Memo;