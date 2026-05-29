import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSquareLetterGFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-square-letter-g" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19 2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm-5 5h-2a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1l.007.117A1 1 0 0 0 13 13v2h-1a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 0 0-2" /></svg>;
const Memo = memo(IconSquareLetterGFilled);
export default Memo;