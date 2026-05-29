import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCircleChevronsLeftFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-circle-chevrons-left" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M11.927 2.133c5.494-.04 9.992 4.359 10.073 9.852v.295c-.081 5.493-4.579 9.893-10.073 9.852-5.494-.04-9.926-4.505-9.926-10 0-5.494 4.432-9.959 9.926-10m3.78 6.16a1 1 0 0 0-1.414 0l-3 3a1 1 0 0 0 0 1.414l3 3a1 1 0 0 0 1.414 0l.083-.094a1 1 0 0 0-.083-1.32L13.415 12l2.292-2.293a1 1 0 0 0 0-1.414m-4 0a1 1 0 0 0-1.414 0l-3 3a1 1 0 0 0 0 1.414l3 3a1 1 0 0 0 1.414 0l.083-.094a1 1 0 0 0-.083-1.32L9.415 12l2.292-2.293a1 1 0 0 0 0-1.414" /></svg>;
const Memo = memo(IconCircleChevronsLeftFilled);
export default Memo;