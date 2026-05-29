import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSquareLetterCFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-square-letter-c" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19 2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm-7 5a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0 1 1 0 0 0-1.993-.117L13 14a1 1 0 0 1-2 0v-4a1 1 0 0 1 1.993-.117L13 10a1 1 0 0 0 2 0 3 3 0 0 0-3-3" /></svg>;
const Memo = memo(IconSquareLetterCFilled);
export default Memo;