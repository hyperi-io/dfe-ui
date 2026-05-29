import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFileTypeDocx = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-file-type-docx" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4M2 15v6h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2zM17 16.5a1.5 1.5 0 0 0-3 0v3a1.5 1.5 0 0 0 3 0M9.5 15a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-3 0v-3A1.5 1.5 0 0 1 9.5 15M19.5 15l3 6M19.5 21l3-6" /></svg>;
const Memo = memo(IconFileTypeDocx);
export default Memo;