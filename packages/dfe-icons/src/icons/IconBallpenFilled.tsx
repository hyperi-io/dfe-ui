import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBallpenFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-ballpen" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17.828 2a3 3 0 0 1 1.977.743l.145.136 1.171 1.17a3 3 0 0 1 .136 4.1l-.136.144L19.415 10l2.292 2.293a1 1 0 0 1 .083 1.32l-.083.094-4 4a1 1 0 0 1-1.497-1.32l.083-.094L19.585 13l-1.586-1.585-7.464 7.464a3.83 3.83 0 0 1-2.474 1.114l-.233.008c-.674 0-1.33-.178-1.905-.508l-1.216 1.214a1 1 0 0 1-1.497-1.32l.083-.094 1.214-1.216a3.83 3.83 0 0 1 .454-4.442l.16-.17L15.707 2.879a3 3 0 0 1 1.923-.873zm0 2a1 1 0 0 0-.608.206l-.099.087L15.414 6 18 8.585l1.707-1.706a1 1 0 0 0 .284-.576l.01-.131a1 1 0 0 0-.207-.609l-.087-.099-1.171-1.171A1 1 0 0 0 17.828 4" /></svg>;
const Memo = memo(IconBallpenFilled);
export default Memo;