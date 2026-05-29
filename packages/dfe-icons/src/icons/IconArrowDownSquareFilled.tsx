import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArrowDownSquareFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-arrow-down-square" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M14 2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v10.584l1.293-1.291a1 1 0 0 1 1.32-.083l.094.083a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-.112.097l-.11.071-.114.054-.105.035-.149.03L12 22l-.075-.003-.126-.017-.111-.03-.111-.044-.098-.052-.096-.067-.09-.08-3-3a1 1 0 0 1 1.414-1.414L11 18.586V8h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" /></svg>;
const Memo = memo(IconArrowDownSquareFilled);
export default Memo;