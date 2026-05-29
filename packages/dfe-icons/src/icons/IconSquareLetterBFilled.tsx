import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSquareLetterBFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-square-letter-b" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19 2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm-7 5h-2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2a3 3 0 0 0 3-3l-.005-.176a3 3 0 0 0-.654-1.7L14.235 12l.106-.124A3 3 0 0 0 12 7m0 6a1 1 0 0 1 0 2h-1v-2zm0-4a1 1 0 0 1 0 2h-1V9z" /></svg>;
const Memo = memo(IconSquareLetterBFilled);
export default Memo;