import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconElevatorFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-elevator" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M18 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-7.293 10.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l2-2a1 1 0 0 0 0-1.414l-.094-.083a1 1 0 0 0-1.32.083l-1.294 1.292zm2-6a1 1 0 0 0-1.414 0l-2 2a1 1 0 0 0 0 1.414l.094.083a1 1 0 0 0 1.32-.083L12 9.415l1.293 1.292a1 1 0 0 0 1.414-1.414z" /></svg>;
const Memo = memo(IconElevatorFilled);
export default Memo;