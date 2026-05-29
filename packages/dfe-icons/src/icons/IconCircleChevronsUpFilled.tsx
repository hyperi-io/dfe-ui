import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCircleChevronsUpFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-circle-chevrons-up" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M11.867 2.001c5.495 0 9.96 4.432 10 9.926S17.508 21.92 12.015 22h-.295c-5.493-.081-9.893-4.579-9.852-10.073.04-5.494 4.505-9.926 10-9.926m.84 9.292a1 1 0 0 0-1.414 0l-3 3a1 1 0 0 0 0 1.414l.094.083a1 1 0 0 0 1.32-.083L12 13.415l2.293 2.292a1 1 0 0 0 1.414-1.414zm0-4a1 1 0 0 0-1.414 0l-3 3a1 1 0 0 0 0 1.414l.094.083a1 1 0 0 0 1.32-.083L12 9.415l2.293 2.292a1 1 0 0 0 1.414-1.414z" /></svg>;
const Memo = memo(IconCircleChevronsUpFilled);
export default Memo;