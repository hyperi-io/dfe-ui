import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconColumns3Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-columns-3" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M4 2h2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM18 2h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1" /></svg>;
const Memo = memo(IconColumns3Filled);
export default Memo;