import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHelicopterLandingFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-helicopter-landing" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19 2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm-4 5a1 1 0 0 0-1 1v3h-4V8a1 1 0 0 0-.883-.993L9 7a1 1 0 0 0-1 1v8a1 1 0 0 0 2 0v-3h4v3a1 1 0 0 0 .883.993L15 17a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1" /></svg>;
const Memo = memo(IconHelicopterLandingFilled);
export default Memo;