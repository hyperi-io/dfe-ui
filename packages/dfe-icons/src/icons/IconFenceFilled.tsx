import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFenceFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-fence" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19 17v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3zM11 17v3a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-3zM20 12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zM8.707 3.293l2 2A1 1 0 0 1 11 6v5H5V6a1 1 0 0 1 .293-.707l2-2a1 1 0 0 1 1.414 0M16.707 3.293l2 2A1 1 0 0 1 19 6v5h-6V6a1 1 0 0 1 .293-.707l2-2a1 1 0 0 1 1.414 0" /></svg>;
const Memo = memo(IconFenceFilled);
export default Memo;