import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAB2 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-a-b-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M16 21h3c.81 0 1.48-.67 1.48-1.48l.02-.02c0-.82-.69-1.5-1.5-1.5h-3zM16 15h2.5c.84-.01 1.5.66 1.5 1.5s-.66 1.5-1.5 1.5H16zM4 9V5c0-1.036.895-2 2-2s2 .964 2 2v4M2.99 11.98a9 9 0 0 0 9 9m9-9a9 9 0 0 0-9-9M8 7H4" /></svg>;
const Memo = memo(IconAB2);
export default Memo;