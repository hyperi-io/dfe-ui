import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSquareLetterNFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-square-letter-n" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19 2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm-8.106 5.553C10.423 6.609 9 6.945 9 8v8a1 1 0 0 0 1 1l.117-.007A1 1 0 0 0 11 16v-3.764l2.106 4.211c.471.944 1.894.608 1.894-.447V8a1 1 0 0 0-1-1l-.117.007A1 1 0 0 0 13 8v3.764z" /></svg>;
const Memo = memo(IconSquareLetterNFilled);
export default Memo;