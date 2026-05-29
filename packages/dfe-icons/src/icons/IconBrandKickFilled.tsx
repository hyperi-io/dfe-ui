import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandKickFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-brand-kick" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M9 3a1 1 0 0 1 1 1v3h1V6a1 1 0 0 1 .883-.993L12 5h1V4a1 1 0 0 1 .883-.993L14 3h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-.883.993L18 11h-1v2h1a1 1 0 0 1 .993.883L19 14v1h1a1 1 0 0 1 .993.883L21 16v4a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-1h-1a1 1 0 0 1-.993-.883L11 18v-1h-1v3a1 1 0 0 1-.883.993L9 21H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /></svg>;
const Memo = memo(IconBrandKickFilled);
export default Memo;