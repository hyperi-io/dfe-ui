import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGridPatternFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-grid-pattern" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M18 3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm-4 4a1 1 0 0 0-1 1v1h-2V8a1 1 0 0 0-.883-.993L10 7a1 1 0 0 0-1 1v1H8a1 1 0 0 0-.993.883L7 10a1 1 0 0 0 1 1h1v2H8a1 1 0 0 0-.993.883L7 14a1 1 0 0 0 1 1h1v1a1 1 0 0 0 .883.993L10 17a1 1 0 0 0 1-1v-1h2v1a1 1 0 0 0 .883.993L14 17a1 1 0 0 0 1-1v-1h1a1 1 0 0 0 .993-.883L17 14a1 1 0 0 0-1-1h-1v-2h1a1 1 0 0 0 .993-.883L17 10a1 1 0 0 0-1-1h-1V8a1 1 0 0 0-.883-.993zm-1 4v2h-2v-2z" /></svg>;
const Memo = memo(IconGridPatternFilled);
export default Memo;