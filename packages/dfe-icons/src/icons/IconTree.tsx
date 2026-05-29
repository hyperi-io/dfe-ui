import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTree = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-tree" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m12 13-2-2M12 12l2-2M12 21V8M9.824 16a3 3 0 0 1-2.743-3.69 3 3 0 0 1 .304-4.833A3 3 0 0 1 12 3.77a3 3 0 0 1 4.614 3.707 3 3 0 0 1 .305 4.833A3 3 0 0 1 14 16.005h-4z" /></svg>;
const Memo = memo(IconTree);
export default Memo;