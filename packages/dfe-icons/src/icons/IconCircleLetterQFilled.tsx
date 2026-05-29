import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCircleLetterQFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-circle-letter-q" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 5a3 3 0 0 0-3 3v4a3 3 0 0 0 4.168 2.764l.125-.057a1 1 0 0 0 1.414-1.414l.057-.125A3 3 0 0 0 15 14v-4a3 3 0 0 0-3-3m1 7.001h-.059a.996.996 0 0 0-.941 1A1 1 0 0 1 11 14v-4a1 1 0 0 1 2 0z" /></svg>;
const Memo = memo(IconCircleLetterQFilled);
export default Memo;