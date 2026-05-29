import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArrowLeftCircleFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-arrow-left-circle" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M6.707 8.293a1 1 0 0 1 0 1.414L5.415 11h10.756a3.001 3.001 0 1 1 0 2H5.415l1.292 1.293a1 1 0 0 1 .083 1.32l-.083.094a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1-.097-.112l-.071-.11-.054-.114-.035-.105-.025-.118-.007-.058L2 12l.003-.075.017-.126.03-.111.044-.111.052-.098.067-.096.08-.09 3-3a1 1 0 0 1 1.414 0" /></svg>;
const Memo = memo(IconArrowLeftCircleFilled);
export default Memo;